import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../../utils/AppError';
import { UserRepo } from '../../DB/repos/user.repo';
import { successHandler } from '../../utils/successHandler';
import { Types } from 'mongoose';

class UserService {
  private readonly userModel = new UserRepo();

  getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const { page = 1, limit = 10, search } = req.query as { page?: number; limit?: number; search?: string };
    
    const filter: any = {};
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const users = await this.userModel.find({
      filter,
      options: {
        skip,
        limit: Number(limit),
        populate: 'friends'
      }
    });

    const total = await this.userModel.count({ filter });

    return successHandler({
      res,
      data: {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      },
      status: 200,
      message: 'Users retrieved successfully'
    });
  }

  getUserById = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const { id } = req.params;
    
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid user ID', 400);
    }

    const user = await this.userModel.findById({
      id,
      options: {
        populate: 'friends'
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return successHandler({
      res,
      data: user,
      status: 200,
      message: 'User retrieved successfully'
    });
  }

  updateUser = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const { id } = req.params;
    const { username, age, phone } = req.body;
    const currentUser = res.locals.user;

    if (!id || !Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid user ID', 400);
    }

    if (currentUser._id.toString() !== id) {
      throw new AppError('You can only update your own profile', 403);
    }

    const user = await this.userModel.findById({ id });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updateData: any = {};
    if (username) updateData.username = username;
    if (age) updateData.age = age;
    if (phone) updateData.phone = phone;

    const updatedUser = await this.userModel.updateOne({
      filter: { _id: id as string },
      update: updateData,
      options: {
        new: true,
        populate: 'friends'
      }
    });

    return successHandler({
      res,
      data: updatedUser,
      status: 200,
      message: 'User updated successfully'
    });
  }

  deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const { id } = req.params;
    const currentUser = res.locals.user;

    if (!id || !Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid user ID', 400);
    }

    if (currentUser._id.toString() !== id) {
      throw new AppError('You can only delete your own account', 403);
    }

    const user = await this.userModel.findById({ id });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await this.userModel.deleteById({ id });

    return successHandler({
      res,
      data: null,
      status: 200,
      message: 'User deleted successfully'
    });
  }
}

export default UserService;

