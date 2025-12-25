import z from "zod";

export const createCommentSchema = z.object({
    content: z.string().min(1, {
        message: 'Comment content is required'
    }).max(1000, {
        message: 'Comment content must be less than 1000 characters'
    }),
    postId: z.string().min(1, { message: 'Post ID is required' }),
});

export const updateCommentSchema = z.object({
    content: z.string().min(1, {
        message: 'Comment content is required'
    }).max(1000, {
        message: 'Comment content must be less than 1000 characters'
    }),
});

export const getCommentByIdSchema = z.object({
    id: z.string().min(1, { message: 'Comment ID is required' }),
});

export const deleteCommentSchema = z.object({
    id: z.string().min(1, { message: 'Comment ID is required' }),
});

export const getCommentsByPostSchema = z.object({
    postId: z.string().min(1, { message: 'Post ID is required' }),
    page: z.string().optional(),
    limit: z.string().optional(),
});

export const likeCommentSchema = z.object({
    id: z.string().min(1, { message: 'Comment ID is required' }),
});

export const unlikeCommentSchema = z.object({
    id: z.string().min(1, { message: 'Comment ID is required' }),
});

