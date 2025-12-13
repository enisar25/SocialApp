import {HydratedDocument, model, models, Schema, Types} from "mongoose"
import { string } from "zod";
import { StringFormatParams } from "zod/v4/core";


 export interface IMessage {
     _id : string;
    createdBy : Types.ObjectId;
    content : string;
    createdAt : Date;
    updatedAT : Date;
 }

 const MessageSchema = new Schema<IMessage>({
    createdBy: {
        type: Types.ObjectId,
        required: true,
        ref: "User"
    },
    content:{
        type: String,
        required: true,
    }
 },{
    timestamps: true
 })


 export interface IChat {
    _id : string;
    participants : Types.ObjectId[];
    messages : IMessage[];
    group? : string;
    groupImage: string;
    rommId?: Types.ObjectId | string;
    createdAt?: Date;
    updatedAt?: Date;
 }

 const ChatSchema = new Schema<HIChat>({
    participants : {
        type: [Types.ObjectId],
        ref: 'User',
        required: true
    },
    messages: {
        type: [MessageSchema],
        required: true
    },
    group:{
        type: String
    },
    groupImage:{
        type: String
    },
    rommId:{
        type: String,
        required: true
    }
 },
 {
    timestamps: true
 }
 );


export type HIChat = HydratedDocument<IChat>

const ChatModel =  models.chat || model<HIChat>('chat', ChatSchema);
export default ChatModel;
 
