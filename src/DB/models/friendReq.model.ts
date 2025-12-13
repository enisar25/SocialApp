import {model, models, Schema, Types} from "mongoose"

 export interface IFriendReq {
    requester : Types.ObjectId | string;
    reciver: Types.ObjectId | string;
    acceptedAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
 }

 const FriendReqSchema = new Schema<IFriendReq>({
    requester : {
        type: Types.ObjectId,
        ref: 'User',
        required: true
    },
    reciver: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
    },
    acceptedAt: {
        type: Date,
        default: null
    },
 },
 {
    timestamps: true
 }
 );

 const FriendReqModel =  models.FriendReq || model<IFriendReq>('FriendReq', FriendReqSchema);
 

 export default FriendReqModel;
 
