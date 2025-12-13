
export interface IError extends Error {
  statusCode: number;
}

export class AppError extends Error implements IError {
  statusCode: number;
    constructor(message: string, statusCode: number ) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
