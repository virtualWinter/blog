'use server';

import { revalidatePath } from 'next/cache';
import { getSession, requireAdmin } from '@/lib/auth';
import { createPostSchema, updatePostSchema, createCommentSchema, updateCommentSchema } from './schema';
import { prisma } from '@/lib/prisma';
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

        return { posts: posts as PublicPost[] };
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

        return { post: post as PublicPost };
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

        return {
            success: true,
            message: 'Comment added successfully!',
            comment: comment as PublicComment,
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

// Note: Import specific modules directly:
// - Types: import { ... } from '@/lib/blog/types'
// - Schemas: import { ... } from '@/lib/blog/schema'