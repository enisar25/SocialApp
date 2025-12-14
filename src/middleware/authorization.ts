
import { AppError } from '../utils/AppError'
import { UserRepo } from '../DB/repos/user.repo';
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import mongoose, { mongo } from 'mongoose';
import { HIuser } from '../modules/userModule/user.types';

export enum TokenTypesEnum {
    ACCESS = 'ACCESS',
    REFRESH = 'REFRESH',
}
const UserModel = new UserRepo();
export interface AuthRequest extends Request{
    user?: HIuser
}

export const decodeToken = async ({  authorization, type = TokenTypesEnum.ACCESS  }:{ authorization: string, type? :TokenTypesEnum  }) => {
    if (!authorization || !authorization.startsWith('Bearer ')) {
        throw new AppError('Unauthorized', 401);
    }
    const token = authorization.split(' ')[1] as string;
    let signature = '';
    if (type === TokenTypesEnum.ACCESS) {
        signature = process.env.ACCESS_SIGNATURE as string;
    } else if (type === TokenTypesEnum.REFRESH) {
        signature = process.env.REFRESH_SIGNATURE as string;
    }
    try {
        const payload  = jwt.verify(token, signature) as JwtPayload;
        const user = await UserModel.findById({ id: payload._id });
        if (!user) {
            throw new AppError('User not found', 404);
        }
        if (!user.isVerified) {
            throw new AppError('Email not verified', 400);
        }
        return user;
    } catch (error) {
        throw new AppError('Invalid or expired token', 401);
    }
}

export const authMiddleware = async (req:AuthRequest, res:Response, next:NextFunction) => {
    const data = await decodeToken({ authorization: req.headers.authorization as string, type: TokenTypesEnum.ACCESS });
    res.locals.user = data;
    req.user = data;
    next();
}

export const graphqlAuth = async (authorization: string) => {
    const data = await decodeToken({ authorization, type: TokenTypesEnum.ACCESS });
    return data
}
        
