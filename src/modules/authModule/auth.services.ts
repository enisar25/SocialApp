import { ConfirmEmailDTO, RegisterDTO, ResendOTPDO, loginDTO } from './auth.DTO';
import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../../utils/AppError';
import { UserRepo } from '../../DB/repos/user.repo';
import { compareHash, hashData } from '../../utils/security/hash';
import { successHandler } from '../../utils/successHandler';
import { emailEvents, EmailEventsEnum } from '../../utils/email/email.events';
import { template } from '../../utils/email/createHtml';
import { createOTP } from '../../utils/email/createOTP';
import { generateToken } from '../../utils/security/token';
import { decodeToken, TokenTypesEnum } from '../../middleware/authorization';
import { OTPFeildsEnum } from '../../DB/models/user.model';
import { uploadFIleToS3 } from '../../utils/multer/s3.services';
import { FriendReqRepo } from '../../DB/repos/friendReq.repo';
import { Types } from 'mongoose';
import { ChatRepo } from '../../DB/repos/chat.repo';

class AuthService {
  private readonly userModel = new UserRepo();
  private readonly friendReqModel = new FriendReqRepo();
    private readonly chatModel = new ChatRepo()


  register = async(req:Request,res:Response,next:NextFunction): Promise< Response > => {

    const { username, email, password, age, phone }: RegisterDTO = req.body;
    const existingUser = await this.userModel.findUserByEmail(email);
    if (existingUser) {
      throw new AppError('Email already in use', 400);
    }

    const otp = createOTP();

    emailEvents.publish(EmailEventsEnum.VERIFY_EMAIL, {
      to: email,
      subject: 'Verify your email',
      html: template({
        otp: otp,
        name: username,
        subject: 'Verify your email'
      })
    });

    const user = await this.userModel.create({
      username,
      email,
      password : await hashData(password),
      age,
      phone,
      emailOTP: {
        code: await hashData(otp),
        expiresAt: new Date(Date.now() + 3 * 60 * 1000) // OTP valid for 3 minutes
      }
    })

    return successHandler({res, data: user, status:201, message: 'User registered successfully'});    
  }

  confirmEmail = async(req:Request,res:Response,next:NextFunction): Promise< Response > => {
    const { email, otp }: ConfirmEmailDTO = req.body;
    const user = await this.userModel.findUserByEmail(email);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    if (user.isVerified) {
      throw new AppError('Email already verified', 400);
    }
    const isOTPValid = await this.userModel.verifyOTP(user._id, OTPFeildsEnum.EMAIL_OTP, otp);
    if (!isOTPValid) {
      throw new AppError('Invalid or expired OTP', 400);
    }
    const verifiedUser = await this.userModel.verifyUserEmail(user._id);
    return successHandler({res, data: verifiedUser, status:200, message: 'Email verified successfully'});
  }

  resendOTP = async(req:Request,res:Response,next:NextFunction): Promise< Response > => {
  const { email }: ResendOTPDO = req.body;
  const user = await this.userModel.findUserByEmail(email);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  if (user.isVerified) {
    throw new AppError('Email already verified', 400);
  }
  if (user.emailOTP && user.emailOTP.expiresAt > new Date()) {
    throw new AppError('Previous OTP is still valid', 400);
  }
  const otp = createOTP();

  emailEvents.publish(EmailEventsEnum.VERIFY_EMAIL, {
    to: email,
    subject: 'Resend OTP - Verify your email',
    html: template({
      otp: otp,
      name: user.username,
      subject: 'Resend OTP - Verify your email'
    })   
  });
  await this.userModel.updateOTP( user._id, OTPFeildsEnum.EMAIL_OTP,{
    code: await hashData(otp),
    expiresAt: new Date(Date.now() + 3 * 60 * 1000) // OTP valid for 3 minutes
    });

  return successHandler({res, data: null, status:200, message: 'OTP resent successfully'});

  }

  login = async(req:Request,res:Response,next:NextFunction): Promise< Response > => {
    const { email, password }: loginDTO = req.body;
    const user = await this.userModel.findUserByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 400);
    }
    const isvalid = await compareHash(password, user.password);
    if (!isvalid) {
      throw new AppError('Invalid email or password', 400);
    }
    if (!user.isVerified) {
      throw new AppError('Email not verified', 400);
    }
    const accessToken = generateToken({
      payload:{_id: user._id},
       signature: process.env.ACCESS_SIGNATURE as string,
       options:{
        expiresIn: '1d' 
        }
      });

    const refreshToken = generateToken({
      payload:{_id: user._id},
       signature: process.env.REFRESH_SIGNATURE as string,
        options:{
        expiresIn: '7d'
        }
      });
    
    return successHandler({res, data: { accessToken, refreshToken }, status:200, message: 'Login successful'});

  }

  refreshToken = async(req:Request,res:Response,next:NextFunction): Promise< Response > => {
    const {authorization} = req.headers;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    console.log('Authorization Header:', authorization);

    const decoded = await decodeToken({ authorization: authorization as string, type: TokenTypesEnum.REFRESH });
    const access_token = generateToken({
      payload:{_id: decoded._id},
       signature: process.env.ACCESS_SIGNATURE as string,
        options:{
        expiresIn: '1d' 
        }
      });
    return successHandler({res, data: { access_token }, status:200, message: 'Token refreshed successfully'});
  }

  forgetPassword = async(req:Request,res:Response,next:NextFunction): Promise< Response > => {
    const { email }: { email: string } = req.body;
    const user = await this.userModel.findUserByEmail(email);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    if (!user.isVerified) {
      throw new AppError('Email not verified', 400);
    }
    const otp = createOTP();

    emailEvents.publish(EmailEventsEnum.PASSWORD_RESET, {
      to: email,
      subject: 'Password Reset OTP',
      html: template({
        otp: otp,
        name: user.username,
        subject: 'Password Reset OTP'
      })
    });
    await this.userModel.updateOTP( user._id, OTPFeildsEnum.RESET_PASSWORD_OTP,{
      code: await hashData(otp),
      expiresAt: new Date(Date.now() + 3 * 60 * 1000) // OTP valid for 3 minutes
      });

    return successHandler({res, data: null, status:200, message: 'Password reset OTP sent successfully'});
  }

  resetPassword = async(req:Request,res:Response,next:NextFunction): Promise< Response > => {
    const { email, otp, newPassword }: { email: string; otp: string; newPassword: string } = req.body;
    const user = await this.userModel.findUserByEmail(email);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    if (!user.isVerified) {
      throw new AppError('Email not verified', 400);
    }
    const isOTPValid = await this.userModel.verifyOTP(user._id, OTPFeildsEnum.RESET_PASSWORD_OTP, otp);
    if (!isOTPValid) {
      throw new AppError('Invalid or expired OTP', 400);
    }
    await this.userModel.resetUserPassword(user._id, await hashData(newPassword));

    return successHandler({res, data: null, status:200, message: 'Password reset successfully'});
  }

  profileImage = async(req:Request,res:Response,next:NextFunction): Promise< Response > => {
    if (!req.file || !res.locals.user) {
      throw new AppError('No file uploaded or user not authenticated', 400);
    }
    const file = req.file
    const userId = res.locals.user._id;
    const result = await uploadFIleToS3({
      file,
      path: `users/${userId}/profile-images`
    });

     return successHandler({res, data: { imageUrl: result }, status:200, message: 'Profile image uploaded successfully'});
  }

  me = async(req:Request,res:Response):Promise <Response> =>{
    const userId = res.locals.user._id
    const user = await this.userModel.findById({
      id: userId,
      options:{
        populate:"friends"
      }      
    })

    const groups = await this .chatModel.find({
      filter:{
        participants:{
          $in: [userId]
        },
        group:{
          $exists:true
        }
      }
    })
    return successHandler({res, data: {user,groups}, status:200, message: 'me'})
  }


  sendFriendRequest = async(req:Request,res:Response,next:NextFunction): Promise< Response > => {
    const { friendId }: { friendId: string } = req.body;
    const user = res.locals.user;
    if (user._id.toString() === friendId) {
      throw new AppError('Cannot send friend request to yourself', 400);
    }
    const reqExist = await this.friendReqModel.findOne({
      filter: { 
        $or: [
          { requester: user._id, reciver: friendId, acceptedAt: { $eq: null } },
          { requester: friendId, reciver: user._id, acceptedAt: { $eq: null } }
        ]
      }
    })
    if (reqExist) {
      throw new AppError('friend request already exists', 400);
    }
    const isFriends = user.friends.includes(friendId);
    if (isFriends) {
      throw new AppError('You are already friends', 400);
    }
    await this.friendReqModel.sendFriendRequest(user._id, friendId);
    return successHandler({res, data: null, status:200, message: 'Friend request sent successfully'});
  }

  acceptFriendRequest = async(req:Request,res:Response,next:NextFunction): Promise< Response > => {
    const { friendId }: { friendId: string } = req.body;
    const user = res.locals.user;
    if(user.friends.includes(friendId)){
        throw new AppError('you are already friends', 400)
    }

    const friendReq = await this.friendReqModel.findOne({
      filter: { requester: friendId, reciver: user._id, acceptedAt: { $eq: null } }
    });
    if (!friendReq) {
      throw new AppError('Friend request not found', 404);
    }
    await this.friendReqModel.acceptFriendRequest(friendId, user._id);
    
    // Update both users' friends lists
    const updatedUser = await this.userModel.updateOne({
      filter: { _id: user._id },
      update: { $addToSet: { friends: friendId } }
    });
    const updatedFriend = await this.userModel.updateOne({
      filter: { _id: friendId },
      update: { $addToSet: { friends: user._id } }
    });
    
    return successHandler({res, data: null, status:200, message: 'Friend request accepted successfully'});
  }
  


}



export default AuthService;