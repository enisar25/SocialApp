import {s3} from "./s3.config";
import { StoreInEnum } from "./multer"
import { ObjectCannedACL, PutObjectCommand } from "@aws-sdk/client-s3";
import { createReadStream } from "fs";

export const uploadFIleToS3 = async(
    {
        stoereIn = StoreInEnum.Memory,
        Bucket = process.env.AWS_BUCKET_NAME as string,
        ACL = 'private',
        path = 'general',
        file,       
    }:{
        stoereIn? : StoreInEnum,
        Bucket? : string,
        ACL?: ObjectCannedACL,
        path? : string,
        file : Express.Multer.File,
    }) => {
        const command = new PutObjectCommand({
            Bucket,
            Key: `${process.env.AWS_FOLDER_NAME}/${path}/${file.originalname}`,
            Body: stoereIn == StoreInEnum.Memory ? file.buffer : createReadStream(file.path),
            ACL,
            ContentType: file.mimetype,
        });

        await s3().send(command);
        return command.input.Key;
    }

