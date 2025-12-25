import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../../utils/AppError';
import { CommentRepo } from '../../DB/repos/comment.repo';
import { PostRepo } from '../../DB/repos/post.repo';
import { successHandler } from '../../utils/successHandler';
import { Types } from 'mongoose';
import { CreateCommentDTO, UpdateCommentDTO } from './comment.DTO';

class CommentService {
  private readonly commentModel = new CommentRepo();
  private readonly postModel = new PostRepo();

  createComment = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const { content, postId }: CreateCommentDTO = req.body;
    const currentUser = res.locals.user;
    const userId = currentUser._id;

    if (!Types.ObjectId.isValid(postId)) {
      throw new AppError('Invalid post ID', 400);
    }

    // Verify post exists
    const post = await this.postModel.findById({ id: postId });
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    const commentData: any = {
      content,
      createdBy: userId,
      postId,
      likes: []
    };

    const comment = await this.commentModel.create(commentData);

    // Add comment to post's comments array
    await this.postModel.updateOne({
      filter: { _id: postId },
      update: { $addToSet: { comments: comment._id } }
    });

    const populatedComment = await this.commentModel.findById({
      id: comment._id,
      options: {
        populate: [
          { path: 'createdBy', select: 'username profileImage' },
          { path: 'postId', select: 'content' },
          { path: 'likes', select: 'username profileImage' }
        ]
      }
    });

    return successHandler({
      res,
      data: populatedComment,
      status: 201,
      message: 'Comment created successfully'
    });
  }

  getCommentsByPost = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const { postId } = req.params;
    const { page = 1, limit = 10 } = req.query as { page?: number; limit?: number };

    if (!postId || !Types.ObjectId.isValid(postId)) {
      throw new AppError('Invalid post ID', 400);
    }

    // Verify post exists
    const post = await this.postModel.findById({ id: postId });
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    const filter: any = { postId };
    const skip = (Number(page) - 1) * Number(limit);
    
    const comments = await this.commentModel.find({
      filter,
      options: {
        skip,
        limit: Number(limit),
        sort: { createdAt: -1 },
        populate: [
          { path: 'createdBy', select: 'username profileImage' },
          { path: 'likes', select: 'username profileImage' }
        ]
      }
    });

    const total = await this.commentModel.count({ filter });

    return successHandler({
      res,
      data: {
        comments,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      },
      status: 200,
      message: 'Comments retrieved successfully'
    });
  }

  getCommentById = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const { id } = req.params;
    
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid comment ID', 400);
    }

    const comment = await this.commentModel.findById({
      id,
      options: {
        populate: [
          { path: 'createdBy', select: 'username profileImage' },
          { path: 'postId', select: 'content createdBy' },
          { path: 'likes', select: 'username profileImage' }
        ]
      }
    });

    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    return successHandler({
      res,
      data: comment,
      status: 200,
      message: 'Comment retrieved successfully'
    });
  }

  updateComment = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const { id } = req.params;
    const { content }: UpdateCommentDTO = req.body;
    const currentUser = res.locals.user;

    if (!id || !Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid comment ID', 400);
    }

    const comment = await this.commentModel.findById({ id });
    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    // Only allow users to update their own comments
    if (comment.createdBy.toString() !== currentUser._id.toString()) {
      throw new AppError('You can only update your own comments', 403);
    }

    const updatedComment = await this.commentModel.updateOne({
      filter: { _id: id as string },
      update: { content },
      options: {
        new: true,
        populate: [
          { path: 'createdBy', select: 'username profileImage' },
          { path: 'postId', select: 'content' },
          { path: 'likes', select: 'username profileImage' }
        ]
      }
    });

    return successHandler({
      res,
      data: updatedComment,
      status: 200,
      message: 'Comment updated successfully'
    });
  }

  deleteComment = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const { id } = req.params;
    const currentUser = res.locals.user;

    if (!id || !Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid comment ID', 400);
    }

    const comment = await this.commentModel.findById({ id });
    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    // Only allow users to delete their own comments
    if (comment.createdBy.toString() !== currentUser._id.toString()) {
      throw new AppError('You can only delete your own comments', 403);
    }

    // Remove comment from post's comments array
    await this.postModel.updateOne({
      filter: { _id: comment.postId as string },
      update: { $pull: { comments: id } }
    });

    await this.commentModel.deleteById({ id });

    return successHandler({
      res,
      data: null,
      status: 200,
      message: 'Comment deleted successfully'
    });
  }

  likeComment = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const { id } = req.params;
    const currentUser = res.locals.user;
    const userId = currentUser._id;

    if (!id || !Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid comment ID', 400);
    }

    const comment = await this.commentModel.findById({ id });
    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    // Check if user already liked the comment
    const alreadyLiked = comment.likes.some(likeId => likeId.toString() === userId.toString());
    if (alreadyLiked) {
      throw new AppError('You have already liked this comment', 400);
    }

    const updatedComment = await this.commentModel.updateOne({
      filter: { _id: id as string },
      update: { $addToSet: { likes: userId } },
      options: {
        new: true,
        populate: [
          { path: 'createdBy', select: 'username profileImage' },
          { path: 'postId', select: 'content' },
          { path: 'likes', select: 'username profileImage' }
        ]
      }
    });

    return successHandler({
      res,
      data: updatedComment,
      status: 200,
      message: 'Comment liked successfully'
    });
  }

  unlikeComment = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const { id } = req.params;
    const currentUser = res.locals.user;
    const userId = currentUser._id;

    if (!id || !Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid comment ID', 400);
    }

    const comment = await this.commentModel.findById({ id });
    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    // Check if user has liked the comment
    const hasLiked = comment.likes.some(likeId => likeId.toString() === userId.toString());
    if (!hasLiked) {
      throw new AppError('You have not liked this comment', 400);
    }

    const updatedComment = await this.commentModel.updateOne({
      filter: { _id: id as string },
      update: { $pull: { likes: userId } },
      options: {
        new: true,
        populate: [
          { path: 'createdBy', select: 'username profileImage' },
          { path: 'postId', select: 'content' },
          { path: 'likes', select: 'username profileImage' }
        ]
      }
    });

    return successHandler({
      res,
      data: updatedComment,
      status: 200,
      message: 'Comment unliked successfully'
    });
  }
}

export default CommentService;

