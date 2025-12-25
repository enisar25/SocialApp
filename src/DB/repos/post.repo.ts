import PostModel, { HIPost, IPost } from "../models/post.model";
import { DBRepo } from "./DBRepo";

export class PostRepo extends DBRepo<HIPost> {
    constructor() {
        super(PostModel);
    }
}

