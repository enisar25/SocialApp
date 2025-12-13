import { customAlphabet } from "nanoid";
const nanoid = customAlphabet("0123456789", 6);

export const createOTP = () => {
  const otp = nanoid();
  return otp
};