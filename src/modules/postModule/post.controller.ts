import { Router } from "express";
import PostService from "./post.services";
import { validationMiddleware } from "../../middleware/validation";
import { 
  createPostSchema, 
  updatePostSchema, 
  getPostByIdSchema, 
  deletePostSchema, 
  getAllPostsSchema,
  likePostSchema,
  unlikePostSchema
} from "./post.validation";
import { authMiddleware } from "../../middleware/authorization";
import { multerFile } from "../../utils/multer/multer";

const postRouter = Router();
const postService = new PostService();

postRouter.get("/",
  authMiddleware,
  validationMiddleware(getAllPostsSchema),
  postService.getAllPosts
);

postRouter.get("/:id",
  authMiddleware,
  validationMiddleware(getPostByIdSchema),
  postService.getPostById
);

postRouter.post("/",
  authMiddleware,
  validationMiddleware(createPostSchema),
  postService.createPost
);

postRouter.patch("/:id",
  authMiddleware,
  validationMiddleware(updatePostSchema),
  postService.updatePost
);

postRouter.delete("/:id",
  authMiddleware,
  validationMiddleware(deletePostSchema),
  postService.deletePost
);

postRouter.patch("/:id/like",
  authMiddleware,
  validationMiddleware(likePostSchema),
  postService.likePost
);

postRouter.patch("/:id/unlike",
  authMiddleware,
  validationMiddleware(unlikePostSchema),
  postService.unlikePost
);

postRouter.post("/upload-images",
  authMiddleware,
  multerFile({}).array('images', 10),
  postService.uploadPostImages
);

export default postRouter;

