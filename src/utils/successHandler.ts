import { Response } from "express";

export const successHandler = ({ res, data={}, status = 200, message = 'Success'}:{ res : Response, data?: any, status?:number, message?:string}) => {
    return res.status(status).json({
        message,
        data
    });
}