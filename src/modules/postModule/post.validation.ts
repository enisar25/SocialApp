import z from "zod";

export const createPostSchema = z.object({
    content: z.string().min(1, {
        message: 'Post content is required'
    }).max(5000, {
        message: 'Post content must be less than 5000 characters'
    }),
    images: z.array(z.string().url()).optional(),
});

export const updatePostSchema = z.object({
    content: z.string().min(1, {
        message: 'Post content is required'
    }).max(5000, {
        message: 'Post content must be less than 5000 characters'
    }).optional(),
    images: z.array(z.string().url()).optional(),
});

export const getPostByIdSchema = z.object({
    id: z.string().min(1, { message: 'Post ID is required' }),
});

export const deletePostSchema = z.object({
    id: z.string().min(1, { message: 'Post ID is required' }),
});

export const getAllPostsSchema = z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    userId: z.string().optional(),
});

export const likePostSchema = z.object({
    id: z.string().min(1, { message: 'Post ID is required' }),
});

export const unlikePostSchema = z.object({
    id: z.string().min(1, { message: 'Post ID is required' }),
});

