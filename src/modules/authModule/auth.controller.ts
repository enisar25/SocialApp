import { Router } from "express";
import AuthService from "./auth.services";
import { validationMiddleware } from "../../middleware/validation";
import { confirmEmailSchema, loginSchema, registerSchema, resendOTPSchema } from "./auth.validation";
import { multerFile } from "../../utils/multer/multer";
import { authMiddleware } from "../../middleware/authorization";
import chatRouter from "../chatModule/chat.controller";
const authRouter = Router();
const authService = new AuthService();

authRouter.use('/:id/chat',chatRouter)

authRouter.get("/", (req, res) => {
  res.send("Auth Home");
});

authRouter.post("/register",
   validationMiddleware(registerSchema),
   authService.register);

authRouter.post("/confirm-email",
  validationMiddleware(confirmEmailSchema),
   authService.confirmEmail);

authRouter.post("/resend-otp",
   validationMiddleware(resendOTPSchema),
   authService.resendOTP);

authRouter.post("/login",
   validationMiddleware(loginSchema),
   authService.login);

authRouter.post("/refresh-token",
   authService.refreshToken);

authRouter.post("/upload-profile-image",
   authMiddleware,
   multerFile({}).single('image'),
   authService.profileImage);

authRouter.get("/me",
   authMiddleware,
   authService.me);

authRouter.patch("/send-friend-request",
   authMiddleware,
   authService.sendFriendRequest);

authRouter.patch("/accept-friend-request",
   authMiddleware,
   authService.acceptFriendRequest);



export default authRouter;