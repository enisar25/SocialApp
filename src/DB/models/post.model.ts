import mongoose, { HydratedDocument, InferSchemaType, model, models, Schema, Types } from "mongoose";

export interface IPost {
    _id: string;
    content: string;
    createdBy: Types.ObjectId | string;
    images?: string[];
    likes: Types.ObjectId[];
    comments: Types.ObjectId[];
    createdAt?: Date;
    updatedAt?: Date;
}

const postSchema = new mongoose.Schema<IPost>({
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
    images: {
        type: [String],
        default: []
    },
    likes: [{
        type: Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        type: Types.ObjectId,
        ref: 'Comment'
    }]
}, {
    timestamps: true
});

export type HIPost = HydratedDocument<IPost>;

const PostModel = models.Post || model<IPost>('Post', postSchema);
export default PostModel;

