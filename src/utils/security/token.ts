import jwt, { JwtPayload } from 'jsonwebtoken';
import { IUser } from '../../modules/userModule/user.types';

export const generateToken = ({ payload ={} ,signature, options = {} }:{ payload: object, signature :string, options?: jwt.SignOptions }) => {
    const token = jwt.sign(payload, signature, options);
    return token;
}

export const verifyToken = ({ token , signature  }:{ token: string, signature :string })   => {
        const payload = jwt.verify(token, signature);
        return payload;
}
