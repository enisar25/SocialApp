import z from "zod";
import { confirmEmailSchema, loginSchema, registerSchema, resendOTPSchema } from "./auth.validation";

export type RegisterDTO = z.infer<typeof registerSchema>;

export type loginDTO = z.infer<typeof loginSchema>;

export type ConfirmEmailDTO = z.infer<typeof confirmEmailSchema>;

export type ResendOTPDO = z.infer<typeof resendOTPSchema>;