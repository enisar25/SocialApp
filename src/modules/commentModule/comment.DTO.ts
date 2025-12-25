import z from "zod";
import { 
    createCommentSchema, 
    updateCommentSchema, 
    getCommentByIdSchema, 
    deleteCommentSchema, 
    getCommentsByPostSchema,
    likeCommentSchema,
    unlikeCommentSchema
} from "./comment.validation";

export type CreateCommentDTO = z.infer<typeof createCommentSchema>;
export type UpdateCommentDTO = z.infer<typeof updateCommentSchema>;
export type GetCommentByIdDTO = z.infer<typeof getCommentByIdSchema>;
export type DeleteCommentDTO = z.infer<typeof deleteCommentSchema>;
export type GetCommentsByPostDTO = z.infer<typeof getCommentsByPostSchema>;
export type LikeCommentDTO = z.infer<typeof likeCommentSchema>;
export type UnlikeCommentDTO = z.infer<typeof unlikeCommentSchema>;

