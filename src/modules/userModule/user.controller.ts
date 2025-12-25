import { Router } from "express";
import UserService from "./user.services";
import { validationMiddleware } from "../../middleware/validation";
import { 
  getUserByIdSchema, 
  updateUserSchema, 
  deleteUserSchema, 
  getAllUsersSchema 
} from "./user.validation";
import { authMiddleware } from "../../middleware/authorization";

const userRouter = Router();
const userService = new UserService();

userRouter.get("/",
  authMiddleware,
  validationMiddleware(getAllUsersSchema),
  userService.getAllUsers
);

userRouter.get("/:id",
  authMiddleware,
  validationMiddleware(getUserByIdSchema),
  userService.getUserById
);

userRouter.patch("/:id",
  authMiddleware,
  validationMiddleware(updateUserSchema),
  userService.updateUser
);

userRouter.delete("/:id",
  authMiddleware,
  validationMiddleware(deleteUserSchema),
  userService.deleteUser
);

export default userRouter;

