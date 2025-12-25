import { Router } from "express";
import authRouter from "./authModule/auth.controller";
import chatRouter from "./chatModule/chat.controller";
import userRouter from "./userModule/user.controller";
import postRouter from "./postModule/post.controller";
import commentRouter from "./commentModule/comment.controller";
const router = Router();

router.use("/auth", authRouter);
router.use("/chat",chatRouter);
router.use("/users", userRouter);
router.use("/posts", postRouter);
router.use("/comments", commentRouter);

export default router;