import CommentModel, { HIComment, IComment } from "../models/comment.model";
import { DBRepo } from "./DBRepo";

export class CommentRepo extends DBRepo<HIComment> {
    constructor() {
        super(CommentModel);
    }
}

