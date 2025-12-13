import { Types } from "mongoose"
import { ChatRepo } from "../../DB/repos/chat.repo"
import { UserRepo } from "../../DB/repos/user.repo"
import { connectedSockets, SocketAuth } from "../../gateway/gateway"
import { AppError } from "../../utils/AppError"

export class ChatSocketServices {
    private readonly chatModel = new ChatRepo()
    private readonly userModel = new UserRepo()

    sendMessage = async(
        socket: SocketAuth,
        data:{
          content: string,
          sendTo: string
    })=>{
        const createdBy = socket.user?._id
        const {content , sendTo} = data
        const to = await this.userModel.findById({id:sendTo})
        if(!to){
            throw new Error('user not found')
        }
        const chat = await this.chatModel.findOne({
            filter:{
                group:{
                    $exists: false
                },
                participants:{
                    $all: [sendTo, createdBy]
                }
            },
        })
        await chat?.updateOne({
            $push:{
                messages:{
                    content,
                    createdBy
                }
            }
        })
        socket.emit("successMessage", content);

        const socketIds = connectedSockets.get(sendTo.toString());
        if (socketIds) {
            for (const id of socketIds) {
                socket.broadcast.to(id).emit("newMessage", {
                    content,
                    from: createdBy,
                });
            }
        }
    }

    joinRoom = async (socket: SocketAuth, roomId: string) => {
    try {
      const userId = socket.user?._id as string
      const group = await this.chatModel.findOne({
        filter: {
          roomId,
          participants: { $in: [userId] },
          group: { $exists: true },
        },
      })
      if (!group) {
        throw new AppError('group  not found',404)
      }
      socket.join(roomId as string)
      console.log('user joined successfully')
    } catch (error) {
      socket.emit('error', {
        type: 'joinRoom',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  SendGroupMessage = async (
    socket: SocketAuth,
    {
      content,
      groupId,
    }: {
      content: string
      groupId: Types.ObjectId
    }
  ) => {
    try {
      const userId = socket.user?._id as string
      const group = await this.chatModel.findOne({
        filter: {
          _id: groupId as unknown as string,
          participants: { $in: [userId] },
          group: { $exists: true },
        },
      })
      if (!group) {
        throw new AppError('group  not found',404)
      }
      await group.updateOne({
        $push: {
          messages: {
            content,
            createdBy: userId
          },
        },
      })
      const roomId = group.rommId as string
      socket.emit('successMessage', content)
      socket.to(roomId).emit('newMessage', {
        content,
        from: socket.user,
        groupId,
      })
    } catch (error) {
      socket.emit('error', {
        type: 'joinRoom',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}
