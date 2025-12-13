import mongoose, { InferSchemaType, model, models } from "mongoose";
import { IUser } from "../../modules/userModule/user.types";

export enum OTPFeildsEnum {
    EMAIL_OTP = 'emailOTP',
    RESET_PASSWORD_OTP = 'resetPasswordOTP',
}

export const OTPSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    }
},{
    _id: false,
});

export type IOTP = InferSchemaType<typeof OTPSchema>;


const userSchema = new mongoose.Schema<IUser>({
    username:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: true,
    },
    age:{
        type: Number,
        required: true,
    },
    phone:{
        type: String,
        required: true,
    },
    isVerified:{
        type: Boolean,
        required: true,
        default: false,
    },
    changedCredentialsAt:{
        type: Date,
        required: false,
    },
    profileImage:{
        type: String,
        required: false,
    },
    coverImages:{
        type: [String],
        required: false,
    },
    folderId:{
        type: String,
        required: false,
    },

    emailOTP: OTPSchema,

    resetPasswordOTP: OTPSchema,

    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
},{
    timestamps: true,
});

const UserModel = models.Users || model<IUser>('User', userSchema);
export default UserModel;