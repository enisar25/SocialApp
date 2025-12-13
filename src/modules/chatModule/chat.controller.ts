import { Router } from "express";
import { ChatService } from "./chat.services";
import { authMiddleware } from "../../middleware/authorization";
const chatServices = new ChatService()
const chatRouter = Router({
    mergeParams:true
})


chatRouter.get('/',
    authMiddleware,
    chatServices.getchat
)

chatRouter.post('/create-group',
    authMiddleware,
    chatServices.createGroup
)

chatRouter.get('/get-group-chat/:groupId',
    authMiddleware,
    chatServices.getGroupChat
)



export default chatRouter