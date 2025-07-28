import { z } from 'zod';

/**
 * Validation schema for email sending
 */
export const emailSchema = z.object({
    to: z.email('Invalid email address'),
    subject: z.string().min(1, 'Subject is required'),
    html: z.string().optional(),
    text: z.string().optional(),
}).refine(
    (data) => data.html || data.text,
    {
        message: 'Either HTML or text content is required',
        path: ['content'],
    }
);