'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSession, requireAdmin } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import type {
    BlogActionResult,
    CreatePostResult,
    UpdatePostResult,
    DeletePostResult,
    CreateCommentResult,
    UpdateCommentResult,
    DeleteCommentResult,
    PublicPost,
    PublicComment
} from './types';

const createPostSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
    content: z.string().min(1, 'Content is required'),
    published: z.boolean().default(false),
});

const updatePostSchema = z.object({
    id: z.string().min(1, 'Post ID is required'),
    title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
    content: z.string().min(1, 'Content is required'),
    published: z.boolean().default(false),
});

const createCommentSchema = z.object({
    postId: z.string().min(1, 'Post ID is required'),
    content: z.string().min(1, 'Comment content is required').max(1000, 'Comment must be less than 1000 characters'),
});

const updateCommentSchema = z.object({
    id: z.string().min(1, 'Comment ID is required'),
    content: z.string().min(1, 'Comment content is required').max(1000, 'Comment must be less than 1000 characters'),
});

// Post Actions
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