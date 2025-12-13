import ChatModel, { HIChat, IChat } from "../models/chat.model";
import { DBRepo } from "./DBRepo";


export class ChatRepo extends DBRepo<HIChat> {
    constructor() {
        super(ChatModel);
    }

}