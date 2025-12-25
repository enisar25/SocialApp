import z from "zod";
import { 
    createPostSchema, 
    updatePostSchema, 
    getPostByIdSchema, 
    deletePostSchema, 
    getAllPostsSchema,
    likePostSchema,
    unlikePostSchema
} from "./post.validation";

export type CreatePostDTO = z.infer<typeof createPostSchema>;
export type UpdatePostDTO = z.infer<typeof updatePostSchema>;
export type GetPostByIdDTO = z.infer<typeof getPostByIdSchema>;
export type DeletePostDTO = z.infer<typeof deletePostSchema>;
export type GetAllPostsDTO = z.infer<typeof getAllPostsSchema>;
export type LikePostDTO = z.infer<typeof likePostSchema>;
export type UnlikePostDTO = z.infer<typeof unlikePostSchema>;

