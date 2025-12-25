import mongoose, { HydratedDocument, model, models, Schema, Types } from "mongoose";

export interface IComment {
    _id: string;
    content: string;
    createdBy: Types.ObjectId | string;
    postId: Types.ObjectId | string;
    likes: Types.ObjectId[];
    createdAt?: Date;
    updatedAt?: Date;
}

const commentSchema = new mongoose.Schema<IComment>({
    content: {
        type: String,
        required: true,
        trim: true
    },
    createdBy: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
    },
    postId: {
        type: Types.ObjectId,
        ref: 'Post',
        required: true
    },
    likes: [{
        type: Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

export type HIComment = HydratedDocument<IComment>;

const CommentModel = models.Comment || model<IComment>('Comment', commentSchema);
export default CommentModel;

