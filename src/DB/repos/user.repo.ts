import { HIuser, IUser } from "../../modules/userModule/user.types";
import { compareHash } from "../../utils/security/hash";
import UserModel, { OTPFeildsEnum } from "../models/user.model";
import { DBRepo } from "./DBRepo";

export class UserRepo extends DBRepo<HIuser> {
  constructor() {
    super(UserModel);
  }
    findUserByEmail = async (email: string): Promise<IUser | null> => {
    const user = await this.model.findOne({ email });
    return user;
  }

    verifyOTP = async (userId: string, OTPFeild: OTPFeildsEnum, otp: string): Promise<boolean> => {
    const user = await this.model.findById(userId);
    if (!user || !user[OTPFeild]) {
      return false;
    }
    const isOTPValid = await compareHash(otp, user[OTPFeild].code);
    const isOTPExpired = user[OTPFeild].expiresAt < new Date();
    return isOTPValid && !isOTPExpired;
  }

    updateOTP = async ( userId: string, OTPFeild: OTPFeildsEnum, otpData: { code: string; expiresAt: Date }): Promise<IUser | null> => {
    const user = await this.model.findByIdAndUpdate(
      userId,
      { [OTPFeild]: otpData },
      { new: true }
    );
    return user;
  }

    verifyUserEmail = async (userId: string): Promise<IUser | null> => {
    const user = await this.model.findByIdAndUpdate(
      userId,
      { isVerified: true, $unset: { emailOTP: 1 } },
      { new: true }
    );
    return user;
  }

  resetUserPassword = async (userId: string, newPassword: string): Promise<IUser | null> => {
    const user = await this.model.findByIdAndUpdate(
      userId,
      { password: newPassword, changedCredentialsAt: new Date(), $unset: { resetPasswordOTP: 1 } },
      { new: true }
    );
    return user;
  }

  
}