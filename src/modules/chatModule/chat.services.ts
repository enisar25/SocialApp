import { ChatRepo } from "../../DB/repos/chat.repo";
import type { NextFunction, Request, Response } from 'express';
import { successHandler } from "../../utils/successHandler";
import { HIuser } from "../userModule/user.types";
import { UserRepo } from "../../DB/repos/user.repo";
import { AppError } from "../../utils/AppError";
import { HIChat, IChat } from "../../DB/models/chat.model";
import { Types } from "mongoose";
import { nanoid } from "nanoid";



export class ChatService {
    private readonly chatmodel = new ChatRepo()
    private readonly userModel = new UserRepo()

    getchat = async(req:Request,res:Response): Promise<Response> => {
        const authUser: HIuser = res.locals.user
        console.log("zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz")
        const {id} = req.params as {id:string}
        const friend = await this.userModel.findById({id})
        if (!friend){
            throw new AppError('user not found',404)
        }
        let chat = await this.chatmodel.findOne({
            filter:{
                group:{
                    $exists: false
                },
                participants:{
                    $all: [authUser._id, friend._id]
                }
            },
            options:{
                populate:[{
                    path:'participants',
                    select: 'username profileImage'
                }
                ]
            }
        })

        if (!chat){
            chat = await this.chatmodel.create({
            participants: [  new Types.ObjectId(authUser._id), new Types.ObjectId(friend._id) ],
            messages: []
        });}

        await chat.populate('participants')

        return successHandler({res,data:chat})
    }

    createGroup = async(req:Request,res:Response):Promise<Response> =>{
        const {groupName,participants}:{
            groupName:string,
            participants: Types.ObjectId[]
        } = req.body

        const user = res.locals.user
        const isParticipantsValid = await this.userModel.find({
            filter:{
                _id:{
                    $in: participants.map(p => p.toString())
                }
            }
        })

        if(participants.length != isParticipantsValid.length){
            throw new AppError('some users dont exist',400)
        }
        const rommId = nanoid(15)
        const group = await this.chatmodel.create({
            participants: [...participants,user._id],
            group: groupName,
            rommId: rommId
        })

        return successHandler({res,data:group})
    }

    getGroupChat = async(req:Request,res:Response):Promise<Response> =>{
        const {groupId} = req.params as {groupId:string}
        const user = res.locals.user as HIuser
        const chat = await this.chatmodel.findOne({
            filter:{
                _id: groupId,
                group:{
                    $exists:true
                },
                participants:{
                    $in:[user._id]
                }
            },
            options:{
                populate:[{
                    path:"messages.createdBy"
                }]
            }
        })


        return successHandler({res, data:{chat}})
    }


}