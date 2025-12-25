import z from "zod";

export const helloSchema = z.object({
    name: z.string().min(4)
})

export const getUserByIdSchema = z.object({
    id: z.string().min(1, { message: 'User ID is required' }),
});

export const updateUserSchema = z.object({
    username: z.string().min(3, {
        message: 'Username must be at least 3 characters long'
    }).optional(),
    age: z.number().min(13, {
        message: 'You must be at least 13 years old'
    }).optional(),
    phone: z.string().min(10, {
        message: 'Phone number must be at least 10 digits long'
    }).optional(),
});

export const deleteUserSchema = z.object({
    id: z.string().min(1, { message: 'User ID is required' }),
});

export const getAllUsersSchema = z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
});