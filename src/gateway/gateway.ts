import { Server as HttpServer } from "node:http";
import { Socket, Server as SocketIOServer } from "socket.io";
import { decodeToken } from "../middleware/authorization";
import { HydratedDocument } from "mongoose";
import { IUser } from "../modules/userModule/user.types";
import { ChatGateway } from "../modules/chatModule/chat.gateway";

export interface SocketAuth extends Socket {
    user?: HydratedDocument<IUser>;
}

export const connectedSockets = new Map<string, Set<string>>();

const initGateway = (httpServer : HttpServer) => {
    const chatGate = new ChatGateway()
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: "*",
        }
    });

    io.use(async(socket : SocketAuth, next : any) => {

        const token = socket.handshake.auth.authorization;
        console.log(token)
        const user = await decodeToken({ authorization: token as string,  });
        console.log('Socket User:', user);
        console.log('Socket ID:', socket.id);
        socket.user = user;
        next();
    });

    io.on("connection", (socket: SocketAuth) => {
    const userId = socket.user?._id.toString() as string;

    const currentSockets = connectedSockets.get(userId) || new Set();
    currentSockets.add(socket.id);

    connectedSockets.set(userId, currentSockets);

    console.log(connectedSockets);

    chatGate.register(socket);

    socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);

        const set = connectedSockets.get(userId);
        if (set) {
            set.delete(socket.id);
            if (set.size === 0) {
                connectedSockets.delete(userId);
            }
        }
    });
});

}

export default initGateway;