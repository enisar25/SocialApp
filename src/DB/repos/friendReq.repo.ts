import { Types } from "mongoose";
import FriendReqModel, { IFriendReq } from "../models/friendReq.model";
import { DBRepo } from "./DBRepo";


export class FriendReqRepo extends DBRepo<IFriendReq> {
    constructor() {
        super(FriendReqModel);
    }

    sendFriendRequest = async(requesterId: Types.ObjectId | string, reciverId: Types.ObjectId | string): Promise<IFriendReq>  => {
        const freindReq = await this.model.create({
            requester: requesterId,
            reciver: reciverId,
        });
        return freindReq;
    }

    acceptFriendRequest = async(requesterId: Types.ObjectId | string, reciverId: Types.ObjectId | string): Promise<IFriendReq | null>  => {
        const friendReq = await this.model.findOneAndUpdate(
            { requester: requesterId, reciver: reciverId, acceptedAt: { $eq: null } },
            { acceptedAt: new Date() },
            { new: true }
        );
        return friendReq;
    }






}