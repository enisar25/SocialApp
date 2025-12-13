import { SocketAuth } from "../../gateway/gateway";
import { ChatEvents } from "./chat.socket.events";


export class ChatGateway {
    private readonly chatEvents = new ChatEvents()

    register= (socket: SocketAuth):void =>{
        this.chatEvents.sendMessage(socket)
        this.chatEvents.JoinRoom(socket)
        this.chatEvents.SendGroupMessage(socket)
    }

}