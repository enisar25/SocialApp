import { Router } from "express";
import authRouter from "./authModule/auth.controller";
import chatRouter from "./chatModule/chat.controller";
const router = Router();

router.use("/auth", authRouter);
router.use("/chat",chatRouter)

export default router;