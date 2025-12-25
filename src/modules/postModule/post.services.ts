import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../../utils/AppError';
import { PostRepo } from '../../DB/repos/post.repo';
import { CommentRepo } from '../../DB/repos/comment.repo';
import { successHandler } from '../../utils/successHandler';
import { Types } from 'mongoose';
import { CreatePostDTO, UpdatePostDTO } from './post.DTO';
import { uploadFIleToS3 } from '../../utils/multer/s3.services';

class PostService {
  private readonly postModel = new PostRepo();
  private readonly commentModel = new CommentRepo();

  createPost = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const { content, images }: CreatePostDTO = req.body;
    const currentUser = res.locals.user;
    const userId = currentUser._id;

    const postData: any = {
      content,
      createdBy: userId,
      images: images || [],
      likes: [],
      comments: []
    };

    const post = await this.postModel.create(postData);

    const populatedPost = await this.postModel.findById({
      id: post._id,
      options: {
        populate: [
          { path: 'createdBy', select: 'username profileImage' },
          { path: 'likes', select: 'username profileImage' }
        ]
      }
    });

    return successHandler({
      res,
      data: populatedPost,
      status: 201,
      message: 'Post created successfully'
    });
  }

  getAllPosts = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const { page = 1, limit = 10, userId } = req.query as { page?: number; limit?: number; userId?: string };
    
    const filter: any = {};
    if (userId) {
      if (!Types.ObjectId.isValid(userId)) {
        throw new AppError('Invalid user ID', 400);
      }
      filter.createdBy = userId;
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const posts = await this.postModel.find({
      filter,
      options: {
        skip,
        limit: Number(limit),
        sort: { createdAt: -1 },
        populate: [
          { path: 'createdBy', select: 'username profileImage' },
          { path: 'likes', select: 'username profileImage' },
          { path: 'comments', select: 'content createdBy', populate: { path: 'createdBy', select: 'username profileImage' } }
        ]
      }
    });

    const total = await this.postModel.count({ filter });

    return successHandler({
      res,
      data: {
        posts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      },
      status: 200,
      message: 'Posts retrieved successfully'
    });
  }

  getPostById = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const { id } = req.params;
    
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid post ID', 400);
    }

    const post = await this.postModel.findById({
      id,
      options: {
        populate: [
          { path: 'createdBy', select: 'username profileImage' },
          { path: 'likes', select: 'username profileImage' },
          { path: 'comments', select: 'content createdBy likes createdAt', 
            populate: [
              { path: 'createdBy', select: 'username profileImage' },
              { path: 'likes', select: 'username profileImage' }
            ]
          }
        ]
      }
    });

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    return successHandler({
      res,
      data: post,
      status: 200,
      message: 'Post retrieved successfully'
    });
  }

  updatePost = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const { id } = req.params;
    const { content, images }: UpdatePostDTO = req.body;
    const currentUser = res.locals.user;

    if (!id || !Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid post ID', 400);
    }

    const post = await this.postModel.findById({ id });
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    // Only allow users to update their own posts
    if (post.createdBy.toString() !== currentUser._id.toString()) {
      throw new AppError('You can only update your own posts', 403);
    }

    const updateData: any = {};
    if (content !== undefined) updateData.content = content;
    if (images !== undefined) updateData.images = images;

    const updatedPost = await this.postModel.updateOne({
      filter: { _id: id as string },
      update: updateData,
      options: {
        new: true,
        populate: [
          { path: 'createdBy', select: 'username profileImage' },
          { path: 'likes', select: 'username profileImage' }
        ]
      }
    });

    return successHandler({
      res,
      data: updatedPost,
      status: 200,
      message: 'Post updated successfully'
    });
  }

  deletePost = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const { id } = req.params;
    const currentUser = res.locals.user;

    if (!id || !Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid post ID', 400);
    }

    const post = await this.postModel.findById({ id });
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    // Only allow users to delete their own posts
    if (post.createdBy.toString() !== currentUser._id.toString()) {
      throw new AppError('You can only delete your own posts', 403);
    }

    // Delete all comments associated with this post
    await this.commentModel.deleteMany({ filter: { postId: id } });

    await this.postModel.deleteById({ id });

    return successHandler({
      res,
      data: null,
      status: 200,
      message: 'Post deleted successfully'
    });
  }

  likePost = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const { id } = req.params;
    const currentUser = res.locals.user;
    const userId = currentUser._id;

    if (!id || !Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid post ID', 400);
    }

    const post = await this.postModel.findById({ id });
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    // Check if user already liked the post
    const alreadyLiked = post.likes.some(likeId => likeId.toString() === userId.toString());
    if (alreadyLiked) {
      throw new AppError('You have already liked this post', 400);
    }

    const updatedPost = await this.postModel.updateOne({
      filter: { _id: id as string },
      update: { $addToSet: { likes: userId } },
      options: {
        new: true,
        populate: [
          { path: 'createdBy', select: 'username profileImage' },
          { path: 'likes', select: 'username profileImage' }
        ]
      }
    });

    return successHandler({
      res,
      data: updatedPost,
      status: 200,
      message: 'Post liked successfully'
    });
  }

  unlikePost = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const { id } = req.params;
    const currentUser = res.locals.user;
    const userId = currentUser._id;

    if (!id || !Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid post ID', 400);
    }

    const post = await this.postModel.findById({ id });
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    // Check if user has liked the post
    const hasLiked = post.likes.some(likeId => likeId.toString() === userId.toString());
    if (!hasLiked) {
      throw new AppError('You have not liked this post', 400);
    }

    const updatedPost = await this.postModel.updateOne({
      filter: { _id: id as string },
      update: { $pull: { likes: userId } },
      options: {
        new: true,
        populate: [
          { path: 'createdBy', select: 'username profileImage' },
          { path: 'likes', select: 'username profileImage' }
        ]
      }
    });

    return successHandler({
      res,
      data: updatedPost,
      status: 200,
      message: 'Post unliked successfully'
    });
  }

  uploadPostImages = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      throw new AppError('No files uploaded', 400);
    }
    const currentUser = res.locals.user;
    const userId = currentUser._id;

    const uploadedImages: string[] = [];
    
    for (const file of req.files as Express.Multer.File[]) {
      const result = await uploadFIleToS3({
        file,
        path: `users/${userId}/posts/images`
      });
      if (result) {
        uploadedImages.push(result);
      }
    }

    return successHandler({
      res,
      data: { images: uploadedImages },
      status: 200,
      message: 'Images uploaded successfully'
    });
  }
}

export default PostService;

