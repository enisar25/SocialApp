import { SocketAuth } from "../../gateway/gateway";
import { ChatSocketServices } from "./chat.socket.service";

export class ChatEvents {
    private readonly chatSocketServives = new ChatSocketServices()
    sendMessage = async(socket:SocketAuth)=>{
        socket.on('sendMessage',(data)=>{
            this.chatSocketServives.sendMessage(socket,data)
        })
    }

    JoinRoom = async (socket: SocketAuth) => {
        socket.on('join_room', ({ roomId }) => {
        this.chatSocketServives.joinRoom(socket, roomId)
        })
    }

    SendGroupMessage = async (socket: SocketAuth) => { 
        socket.on('sendGroupMessage', (data) => {
        this.chatSocketServives.SendGroupMessage(socket, data)
        })
    }
}