import { Router } from "express";
import CommentService from "./comment.services";
import { validationMiddleware } from "../../middleware/validation";
import { 
  createCommentSchema, 
  updateCommentSchema, 
  getCommentByIdSchema, 
  deleteCommentSchema, 
  getCommentsByPostSchema,
  likeCommentSchema,
  unlikeCommentSchema
} from "./comment.validation";
import { authMiddleware } from "../../middleware/authorization";

const commentRouter = Router();
const commentService = new CommentService();

commentRouter.get("/post/:postId",
  authMiddleware,
  validationMiddleware(getCommentsByPostSchema),
  commentService.getCommentsByPost
);

commentRouter.get("/:id",
  authMiddleware,
  validationMiddleware(getCommentByIdSchema),
  commentService.getCommentById
);

commentRouter.post("/",
  authMiddleware,
  validationMiddleware(createCommentSchema),
  commentService.createComment
);

commentRouter.patch("/:id",
  authMiddleware,
  validationMiddleware(updateCommentSchema),
  commentService.updateComment
);

commentRouter.delete("/:id",
  authMiddleware,
  validationMiddleware(deleteCommentSchema),
  commentService.deleteComment
);

commentRouter.patch("/:id/like",
  authMiddleware,
  validationMiddleware(likeCommentSchema),
  commentService.likeComment
);

commentRouter.patch("/:id/unlike",
  authMiddleware,
  validationMiddleware(unlikeCommentSchema),
  commentService.unlikeComment
);

export default commentRouter;

