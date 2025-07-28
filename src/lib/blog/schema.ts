import { z } from 'zod';

/**
 * Validation schema for creating a blog post
 */
export const createPostSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
    content: z.string().min(1, 'Content is required'),
    published: z.boolean().default(false),
});

/**
 * Validation schema for updating a blog post
 */
export const updatePostSchema = z.object({
    id: z.string().min(1, 'Post ID is required'),
    title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
    content: z.string().min(1, 'Content is required'),
    published: z.boolean().default(false),
});

/**
 * Validation schema for creating a comment
 */
export const createCommentSchema = z.object({
    postId: z.string().min(1, 'Post ID is required'),
    content: z.string().min(1, 'Comment content is required').max(1000, 'Comment must be less than 1000 characters'),
});

/**
 * Validation schema for updating a comment
 */
export const updateCommentSchema = z.object({
    id: z.string().min(1, 'Comment ID is required'),
    content: z.string().min(1, 'Comment content is required').max(1000, 'Comment must be less than 1000 characters'),
});