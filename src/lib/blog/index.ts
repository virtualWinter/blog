'use server';

import { revalidatePath } from 'next/cache';
import { getSession, requireAdmin } from '@/lib/auth';
import { createPostSchema, updatePostSchema, createCommentSchema, updateCommentSchema } from './schema';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';
import { getClientIP } from '@/lib/rate-limit/utils';
import { trackEvent } from '@/lib/analytics';
import type {
    CreatePostResult,
    UpdatePostResult,
    DeletePostResult,
    CreateCommentResult,
    UpdateCommentResult,
    DeleteCommentResult,
    PublicPost,
    PublicComment
} from './types';

// Post Actions

/**
 * Server action to create a new blog post (admin only)
 * @param formData - Form data containing title, content, and published status
 * @returns Promise that resolves to create post result
 */
export async function createPost(formData: FormData): Promise<CreatePostResult> {
    const result = createPostSchema.safeParse({
        title: formData.get('title'),
        content: formData.get('content'),
        published: formData.get('published') === 'true',
    });

    if (!result.success) {
        return {
            error: result.error.issues[0].message,
        };
    }

    try {
        // Check if current user is admin
        const authResult = await requireAdmin();
        if (!authResult.authorized) {
            return {
                error: authResult.reason || 'Only admins can create posts',
            };
        }

        const session = await getSession();
        if (!session) {
            return {
                error: 'Authentication required',
            };
        }

        const { title, content, published } = result.data;

        const post = await prisma.post.create({
            data: {
                title,
                content,
                published,
                authorId: session.userId,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                _count: {
                    select: {
                        comments: true,
                    },
                },
            },
        });

        revalidatePath('/blog');
        revalidatePath('/dashboard');

        return {
            success: true,
            message: 'Post created successfully!',
            post: post as PublicPost,
        };
    } catch (error) {
        console.error('Create post error:', error);
        return {
            error: 'Something went wrong. Please try again.',
        };
    }
}

/**
 * Server action to update an existing blog post (admin only)
 * @param formData - Form data containing post ID, title, content, and published status
 * @returns Promise that resolves to update post result
 */
export async function updatePost(formData: FormData): Promise<UpdatePostResult> {
    const result = updatePostSchema.safeParse({
        id: formData.get('id'),
        title: formData.get('title'),
        content: formData.get('content'),
        published: formData.get('published') === 'true',
    });

    if (!result.success) {
        return {
            error: result.error.issues[0].message,
        };
    }

    try {
        // Check if current user is admin
        const authResult = await requireAdmin();
        if (!authResult.authorized) {
            return {
                error: authResult.reason || 'Only admins can update posts',
            };
        }

        const { id, title, content, published } = result.data;

        // Check if post exists
        const existingPost = await prisma.post.findUnique({
            where: { id },
        });

        if (!existingPost) {
            return {
                error: 'Post not found.',
            };
        }

        const post = await prisma.post.update({
            where: { id },
            data: {
                title,
                content,
                published,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                _count: {
                    select: {
                        comments: true,
                    },
                },
            },
        });

        revalidatePath('/blog');
        revalidatePath('/dashboard');
        revalidatePath(`/blog/${id}`);

        return {
            success: true,
            message: 'Post updated successfully!',
            post: post as PublicPost,
        };
    } catch (error) {
        console.error('Update post error:', error);
        return {
            error: 'Something went wrong. Please try again.',
        };
    }
}

/**
 * Server action to delete a blog post (admin only)
 * @param postId - The ID of the post to delete
 * @returns Promise that resolves to delete post result
 */
export async function deletePost(postId: string): Promise<DeletePostResult> {
    try {
        // Check if current user is admin
        const authResult = await requireAdmin();
        if (!authResult.authorized) {
            return {
                error: authResult.reason || 'Only admins can delete posts',
            };
        }

        // Check if post exists
        const existingPost = await prisma.post.findUnique({
            where: { id: postId },
        });

        if (!existingPost) {
            return {
                error: 'Post not found.',
            };
        }

        // Delete post (cascade will handle comments)
        await prisma.post.delete({
            where: { id: postId },
        });

        revalidatePath('/blog');
        revalidatePath('/dashboard');

        return {
            success: true,
            message: 'Post deleted successfully.',
        };
    } catch (error) {
        console.error('Delete post error:', error);
        return {
            error: 'Something went wrong. Please try again.',
        };
    }
}

/**
 * Gets all blog posts with optional unpublished posts for admins
 * @param includeUnpublished - Whether to include unpublished posts (admin only)
 * @returns Promise that resolves to array of posts or error
 */
export async function getAllPosts(includeUnpublished = false): Promise<{ posts?: PublicPost[]; error?: string }> {
    try {
        const session = await getSession();

        // Only admins can see unpublished posts
        const canSeeUnpublished = includeUnpublished && session &&
            await prisma.user.findUnique({
                where: { id: session.userId },
                select: { role: true },
            }).then(user => user?.role === 'ADMIN');

        const posts = await prisma.post.findMany({
            where: canSeeUnpublished ? {} : { published: true },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                _count: {
                    select: {
                        comments: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Get view counts for all posts
        const postIds = posts.map(post => post.id);
        const viewCounts = await getPostViewCounts(postIds);

        // Add view counts to posts
        const postsWithViews = posts.map(post => ({
            ...post,
            _count: {
                ...post._count,
                views: viewCounts.get(post.id) || 0,
            },
        }));

        return { posts: postsWithViews as PublicPost[] };
    } catch (error) {
        console.error('Get all posts error:', error);
        return {
            error: 'Something went wrong. Please try again.',
        };
    }
}

/**
 * Gets a single blog post by ID with permission checks
 * @param postId - The ID of the post to retrieve
 * @returns Promise that resolves to post data or error
 */
export async function getPostById(postId: string): Promise<{ post?: PublicPost; error?: string }> {
    try {
        const session = await getSession();

        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                _count: {
                    select: {
                        comments: true,
                    },
                },
            },
        });

        if (!post) {
            return {
                error: 'Post not found.',
            };
        }

        // Check if user can see unpublished posts
        if (!post.published) {
            if (!session) {
                return {
                    error: 'Post not found.',
                };
            }

            const user = await prisma.user.findUnique({
                where: { id: session.userId },
                select: { role: true },
            });

            if (user?.role !== 'ADMIN') {
                return {
                    error: 'Post not found.',
                };
            }
        }

        // Get view count for this post
        const viewCount = await getPostViewCount(postId);

        // Add view count to post
        const postWithViews = {
            ...post,
            _count: {
                ...post._count,
                views: viewCount,
            },
        };

        return { post: postWithViews as PublicPost };
    } catch (error) {
        console.error('Get post by ID error:', error);
        return {
            error: 'Something went wrong. Please try again.',
        };
    }
}

// Comment Actions

/**
 * Server action to create a new comment on a blog post
 * @param formData - Form data containing post ID and comment content
 * @returns Promise that resolves to create comment result
 */
export async function createComment(formData: FormData): Promise<CreateCommentResult> {
    const result = createCommentSchema.safeParse({
        postId: formData.get('postId'),
        content: formData.get('content'),
    });

    if (!result.success) {
        return {
            error: result.error.issues[0].message,
        };
    }

    try {
        const session = await getSession();
        if (!session) {
            return {
                error: 'You must be signed in to comment.',
            };
        }

        // Rate limit comment creation: 5 comments per 15 minutes per user
        const userRateLimitResult = await rateLimit(session.userId, {
            windowMs: 15 * 60 * 1000, // 15 minutes
            maxRequests: 5,
            namespace: 'comment-create-user',
        });

        if (!userRateLimitResult.success) {
            return {
                error: formatRateLimitError(userRateLimitResult.retryAfter, 'comment'),
            };
        }

        // Additional IP-based rate limiting: 10 comments per 15 minutes per IP
        const clientIP = await getClientIP();
        const ipRateLimitResult = await rateLimit(clientIP, {
            windowMs: 15 * 60 * 1000, // 15 minutes
            maxRequests: 10,
            namespace: 'comment-create-ip',
        });

        if (!ipRateLimitResult.success) {
            return {
                error: formatRateLimitError(ipRateLimitResult.retryAfter, 'comment from this location'),
            };
        }

        const { postId, content } = result.data;

        // Check if post exists and is published
        const post = await prisma.post.findUnique({
            where: { id: postId },
        });

        if (!post) {
            return {
                error: 'Post not found.',
            };
        }

        if (!post.published) {
            // Check if user is admin to comment on unpublished posts
            const user = await prisma.user.findUnique({
                where: { id: session.userId },
                select: { role: true },
            });

            if (user?.role !== 'ADMIN') {
                return {
                    error: 'Cannot comment on unpublished posts.',
                };
            }
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                postId,
                authorId: session.userId,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });

        revalidatePath(`/blog/${postId}`);

        // Track comment creation event
        try {
            await trackEvent({
                type: 'comment_created',
                userId: session.userId,
                path: `/blog/${postId}`,
                metadata: {
                    postId,
                    commentId: comment.id,
                    contentLength: content.length,
                },
            });
        } catch (analyticsError) {
            console.error('Failed to track comment creation event:', analyticsError);
        }

        return {
            success: true,
            message: 'Comment added successfully!',
            comment: comment as PublicComment,
            rateLimitInfo: {
                userRemaining: userRateLimitResult.remaining,
                userResetTime: userRateLimitResult.resetTime,
                ipRemaining: ipRateLimitResult.remaining,
                ipResetTime: ipRateLimitResult.resetTime,
            },
        };
    } catch (error) {
        console.error('Create comment error:', error);
        return {
            error: 'Something went wrong. Please try again.',
        };
    }
}

/**
 * Server action to update an existing comment
 * Users can only update their own comments, admins can update any comment
 * @param formData - Form data containing comment ID and new content
 * @returns Promise that resolves to update comment result
 */
export async function updateComment(formData: FormData): Promise<UpdateCommentResult> {
    const result = updateCommentSchema.safeParse({
        id: formData.get('id'),
        content: formData.get('content'),
    });

    if (!result.success) {
        return {
            error: result.error.issues[0].message,
        };
    }

    try {
        const session = await getSession();
        if (!session) {
            return {
                error: 'You must be signed in to update comments.',
            };
        }

        // Rate limit comment updates: 10 updates per 15 minutes per user
        const userRateLimitResult = await rateLimit(session.userId, {
            windowMs: 15 * 60 * 1000, // 15 minutes
            maxRequests: 10,
            namespace: 'comment-update-user',
        });

        if (!userRateLimitResult.success) {
            return {
                error: formatRateLimitError(userRateLimitResult.retryAfter, 'comment update'),
            };
        }

        // Additional IP-based rate limiting: 15 updates per 15 minutes per IP
        const clientIP = await getClientIP();
        const ipRateLimitResult = await rateLimit(clientIP, {
            windowMs: 15 * 60 * 1000, // 15 minutes
            maxRequests: 15,
            namespace: 'comment-update-ip',
        });

        if (!ipRateLimitResult.success) {
            return {
                error: formatRateLimitError(ipRateLimitResult.retryAfter, 'comment update from this location'),
            };
        }

        const { id, content } = result.data;

        // Check if comment exists
        const existingComment = await prisma.comment.findUnique({
            where: { id },
            include: { post: true },
        });

        if (!existingComment) {
            return {
                error: 'Comment not found.',
            };
        }

        // Check if user owns the comment or is admin
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { role: true },
        });

        if (existingComment.authorId !== session.userId && user?.role !== 'ADMIN') {
            return {
                error: 'You can only edit your own comments.',
            };
        }

        const comment = await prisma.comment.update({
            where: { id },
            data: { content },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });

        revalidatePath(`/blog/${existingComment.postId}`);

        return {
            success: true,
            message: 'Comment updated successfully!',
            comment: comment as PublicComment,
            rateLimitInfo: {
                userRemaining: userRateLimitResult.remaining,
                userResetTime: userRateLimitResult.resetTime,
                ipRemaining: ipRateLimitResult.remaining,
                ipResetTime: ipRateLimitResult.resetTime,
            },
        };
    } catch (error) {
        console.error('Update comment error:', error);
        return {
            error: 'Something went wrong. Please try again.',
        };
    }
}

/**
 * Server action to delete a comment
 * Users can only delete their own comments, admins can delete any comment
 * @param commentId - The ID of the comment to delete
 * @returns Promise that resolves to delete comment result
 */
export async function deleteComment(commentId: string): Promise<DeleteCommentResult> {
    try {
        const session = await getSession();
        if (!session) {
            return {
                error: 'You must be signed in to delete comments.',
            };
        }

        // Rate limit comment deletions: 5 deletions per 15 minutes per user
        const userRateLimitResult = await rateLimit(session.userId, {
            windowMs: 15 * 60 * 1000, // 15 minutes
            maxRequests: 5,
            namespace: 'comment-delete-user',
        });

        if (!userRateLimitResult.success) {
            return {
                error: formatRateLimitError(userRateLimitResult.retryAfter, 'comment deletion'),
            };
        }

        // Additional IP-based rate limiting: 8 deletions per 15 minutes per IP
        const clientIP = await getClientIP();
        const ipRateLimitResult = await rateLimit(clientIP, {
            windowMs: 15 * 60 * 1000, // 15 minutes
            maxRequests: 8,
            namespace: 'comment-delete-ip',
        });

        if (!ipRateLimitResult.success) {
            return {
                error: formatRateLimitError(ipRateLimitResult.retryAfter, 'comment deletion from this location'),
            };
        }

        // Check if comment exists
        const existingComment = await prisma.comment.findUnique({
            where: { id: commentId },
        });

        if (!existingComment) {
            return {
                error: 'Comment not found.',
            };
        }

        // Check if user owns the comment or is admin
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { role: true },
        });

        if (existingComment.authorId !== session.userId && user?.role !== 'ADMIN') {
            return {
                error: 'You can only delete your own comments.',
            };
        }

        await prisma.comment.delete({
            where: { id: commentId },
        });

        revalidatePath(`/blog/${existingComment.postId}`);

        return {
            success: true,
            message: 'Comment deleted successfully.',
        };
    } catch (error) {
        console.error('Delete comment error:', error);
        return {
            error: 'Something went wrong. Please try again.',
        };
    }
}

/**
 * Gets all comments for a specific blog post
 * @param postId - The ID of the post to get comments for
 * @returns Promise that resolves to array of comments or error
 */
export async function getCommentsByPostId(postId: string): Promise<{ comments?: PublicComment[]; error?: string }> {
    try {
        const comments = await prisma.comment.findMany({
            where: { postId },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        return { comments: comments as PublicComment[] };
    } catch (error) {
        console.error('Get comments by post ID error:', error);
        return {
            error: 'Something went wrong. Please try again.',
        };
    }
}

/**
 * Gets all comments for admin management (admin only)
 * @returns Promise that resolves to array of comments with post info or error
 */
export async function getAllComments(): Promise<{ comments?: (PublicComment & { post: { id: string; title: string } })[]; error?: string }> {
    try {
        const authResult = await requireAdmin();
        if (!authResult.authorized) {
            return {
                error: authResult.reason || 'Only admins can view all comments',
            };
        }

        const comments = await prisma.comment.findMany({
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                post: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return { comments: comments as (PublicComment & { post: { id: string; title: string } })[] };
    } catch (error) {
        console.error('Get all comments error:', error);
        return {
            error: 'Something went wrong. Please try again.',
        };
    }
}

/**
 * Checks comment rate limits for the current user without incrementing counters
 * @returns Promise that resolves to rate limit status
 */
export async function checkCommentRateLimits(): Promise<{
    canComment: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    userCommentRemaining: number;
    userUpdateRemaining: number;
    userDeleteRemaining: number;
    ipCommentRemaining: number;
    ipUpdateRemaining: number;
    ipDeleteRemaining: number;
    error?: string;
}> {
    try {
        const session = await getSession();
        if (!session) {
            return {
                canComment: false,
                canUpdate: false,
                canDelete: false,
                userCommentRemaining: 0,
                userUpdateRemaining: 0,
                userDeleteRemaining: 0,
                ipCommentRemaining: 0,
                ipUpdateRemaining: 0,
                ipDeleteRemaining: 0,
                error: 'Authentication required',
            };
        }

        const clientIP = await getClientIP();

        // Check all rate limits without incrementing
        const [
            userCommentLimit,
            userUpdateLimit,
            userDeleteLimit,
            ipCommentLimit,
            ipUpdateLimit,
            ipDeleteLimit,
        ] = await Promise.all([
            // User-based limits
            rateLimit(session.userId, {
                windowMs: 15 * 60 * 1000,
                maxRequests: 5,
                namespace: 'comment-create-user',
            }),
            rateLimit(session.userId, {
                windowMs: 15 * 60 * 1000,
                maxRequests: 10,
                namespace: 'comment-update-user',
            }),
            rateLimit(session.userId, {
                windowMs: 15 * 60 * 1000,
                maxRequests: 5,
                namespace: 'comment-delete-user',
            }),
            // IP-based limits
            rateLimit(clientIP, {
                windowMs: 15 * 60 * 1000,
                maxRequests: 10,
                namespace: 'comment-create-ip',
            }),
            rateLimit(clientIP, {
                windowMs: 15 * 60 * 1000,
                maxRequests: 15,
                namespace: 'comment-update-ip',
            }),
            rateLimit(clientIP, {
                windowMs: 15 * 60 * 1000,
                maxRequests: 8,
                namespace: 'comment-delete-ip',
            }),
        ]);

        return {
            canComment: userCommentLimit.success && ipCommentLimit.success,
            canUpdate: userUpdateLimit.success && ipUpdateLimit.success,
            canDelete: userDeleteLimit.success && ipDeleteLimit.success,
            userCommentRemaining: userCommentLimit.remaining,
            userUpdateRemaining: userUpdateLimit.remaining,
            userDeleteRemaining: userDeleteLimit.remaining,
            ipCommentRemaining: ipCommentLimit.remaining,
            ipUpdateRemaining: ipUpdateLimit.remaining,
            ipDeleteRemaining: ipDeleteLimit.remaining,
        };
    } catch (error) {
        console.error('Check comment rate limits error:', error);
        return {
            canComment: true, // Fail open
            canUpdate: true,
            canDelete: true,
            userCommentRemaining: 5,
            userUpdateRemaining: 10,
            userDeleteRemaining: 5,
            ipCommentRemaining: 10,
            ipUpdateRemaining: 15,
            ipDeleteRemaining: 8,
            error: 'Failed to check rate limits',
        };
    }
}

/**
 * Gets dashboard statistics for the current user
 * @returns Promise that resolves to dashboard stats or error
 */
export async function getDashboardStats(): Promise<{ 
    stats?: {
        totalPosts: number;
        publishedPosts: number;
        unpublishedPosts: number;
        totalComments: number;
        userComments: number;
    }; 
    error?: string 
}> {
    try {
        const session = await getSession();
        if (!session) {
            return {
                error: 'Authentication required',
            };
        }

        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { role: true },
        });

        const isAdmin = user?.role === 'ADMIN';

        // Get post counts
        const [totalPosts, publishedPosts, unpublishedPosts, totalComments, userComments] = await Promise.all([
            // Total posts (admin only, otherwise 0)
            isAdmin ? prisma.post.count() : Promise.resolve(0),
            // Published posts count
            prisma.post.count({ where: { published: true } }),
            // Unpublished posts (admin only, otherwise 0)
            isAdmin ? prisma.post.count({ where: { published: false } }) : Promise.resolve(0),
            // Total comments (admin only, otherwise 0)
            isAdmin ? prisma.comment.count() : Promise.resolve(0),
            // User's own comments
            prisma.comment.count({ where: { authorId: session.userId } }),
        ]);

        return {
            stats: {
                totalPosts,
                publishedPosts,
                unpublishedPosts,
                totalComments,
                userComments,
            },
        };
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        return {
            error: 'Something went wrong. Please try again.',
        };
    }
}

/**
 * Gets unpublished posts for admin users
 * @returns Promise that resolves to array of unpublished posts or error
 */
export async function getUnpublishedPosts(): Promise<{ posts?: PublicPost[]; error?: string }> {
    try {
        const authResult = await requireAdmin();
        if (!authResult.authorized) {
            return {
                error: authResult.reason || 'Only admins can view unpublished posts',
            };
        }

        const posts = await prisma.post.findMany({
            where: { published: false },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                _count: {
                    select: {
                        comments: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return { posts: posts as PublicPost[] };
    } catch (error) {
        console.error('Get unpublished posts error:', error);
        return {
            error: 'Something went wrong. Please try again.',
        };
    }
}

/**
 * Formats a rate limit error message with time remaining
 * @param retryAfter - Seconds until retry is allowed
 * @param action - The action being rate limited
 * @returns Formatted error message
 */
function formatRateLimitError(retryAfter: number, action: string): string {
    const minutes = Math.ceil(retryAfter / 60);
    const seconds = retryAfter % 60;
    
    if (minutes > 0) {
        return `Too many ${action}s. Please wait ${minutes} minute${minutes > 1 ? 's' : ''} before trying again.`;
    } else {
        return `Too many ${action}s. Please wait ${seconds} second${seconds > 1 ? 's' : ''} before trying again.`;
    }
}

/**
 * Gets rate limit status for comment actions
 * @param userId - User ID to check
 * @param clientIP - Client IP to check
 * @returns Promise that resolves to rate limit status
 */
export async function getCommentRateLimitStatus(userId: string, clientIP: string): Promise<{
    comment: { user: boolean; ip: boolean; userRemaining: number; ipRemaining: number };
    update: { user: boolean; ip: boolean; userRemaining: number; ipRemaining: number };
    delete: { user: boolean; ip: boolean; userRemaining: number; ipRemaining: number };
}> {
    const [
        userCommentCheck,
        userUpdateCheck,
        userDeleteCheck,
        ipCommentCheck,
        ipUpdateCheck,
        ipDeleteCheck,
    ] = await Promise.all([
        rateLimit(userId, { windowMs: 15 * 60 * 1000, maxRequests: 5, namespace: 'comment-create-user' }),
        rateLimit(userId, { windowMs: 15 * 60 * 1000, maxRequests: 10, namespace: 'comment-update-user' }),
        rateLimit(userId, { windowMs: 15 * 60 * 1000, maxRequests: 5, namespace: 'comment-delete-user' }),
        rateLimit(clientIP, { windowMs: 15 * 60 * 1000, maxRequests: 10, namespace: 'comment-create-ip' }),
        rateLimit(clientIP, { windowMs: 15 * 60 * 1000, maxRequests: 15, namespace: 'comment-update-ip' }),
        rateLimit(clientIP, { windowMs: 15 * 60 * 1000, maxRequests: 8, namespace: 'comment-delete-ip' }),
    ]);

    return {
        comment: {
            user: userCommentCheck.success,
            ip: ipCommentCheck.success,
            userRemaining: userCommentCheck.remaining,
            ipRemaining: ipCommentCheck.remaining,
        },
        update: {
            user: userUpdateCheck.success,
            ip: ipUpdateCheck.success,
            userRemaining: userUpdateCheck.remaining,
            ipRemaining: ipUpdateCheck.remaining,
        },
        delete: {
            user: userDeleteCheck.success,
            ip: ipDeleteCheck.success,
            userRemaining: userDeleteCheck.remaining,
            ipRemaining: ipDeleteCheck.remaining,
        },
    };
}

/**
 * Gets view count for a specific post from analytics data
 * @param postId - The ID of the post
 * @returns Promise that resolves to view count
 */
export async function getPostViewCount(postId: string): Promise<number> {
    try {
        const viewCount = await prisma.analyticsEvent.count({
            where: {
                type: 'post_view',
                metadata: {
                    contains: `"postId":"${postId}"`
                }
            }
        });
        
        return viewCount;
    } catch (error) {
        console.error('Get post view count error:', error);
        return 0;
    }
}

/**
 * Gets view counts for multiple posts
 * @param postIds - Array of post IDs
 * @returns Promise that resolves to map of post ID to view count
 */
export async function getPostViewCounts(postIds: string[]): Promise<Map<string, number>> {
    const viewCounts = new Map<string, number>();
    
    try {
        // Get all post view events for the given post IDs
        const events = await prisma.analyticsEvent.findMany({
            where: {
                type: 'post_view',
                metadata: {
                    not: null
                }
            },
            select: {
                metadata: true
            }
        });

        // Count views for each post
        for (const event of events) {
            if (event.metadata) {
                try {
                    const metadata = JSON.parse(event.metadata);
                    const postId = metadata.postId;
                    
                    if (postIds.includes(postId)) {
                        const currentCount = viewCounts.get(postId) || 0;
                        viewCounts.set(postId, currentCount + 1);
                    }
                } catch (parseError) {
                    // Skip invalid metadata
                    continue;
                }
            }
        }

        // Ensure all requested post IDs have a count (even if 0)
        for (const postId of postIds) {
            if (!viewCounts.has(postId)) {
                viewCounts.set(postId, 0);
            }
        }

        return viewCounts;
    } catch (error) {
        console.error('Get post view counts error:', error);
        
        // Return empty counts for all posts on error
        for (const postId of postIds) {
            viewCounts.set(postId, 0);
        }
        return viewCounts;
    }
}