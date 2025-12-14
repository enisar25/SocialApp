import { GraphQLID, GraphQLInt, GraphQLObjectType, GraphQLString } from "graphql";
import { IOTP } from "../../DB/models/user.model";
import { HydratedDocument } from "mongoose";

export interface IUser {
    _id: string;
    username: string;
    email: string;
    password: string;
    age: number;
    phone: string;
    isVerified: boolean;
    changedCredentialsAt?: Date;
    profileImage?: string;
    coverImages?: string[];
    folderId: string;
    createdAt: Date;
    updatedAt: Date;
    emailOTP: IOTP;
    resetPasswordOTP: IOTP;
    friends: string[];
}

export const GraphQlUserType = new GraphQLObjectType({
    name:"usertype",
    fields:{
        _id:{type:GraphQLID},
        username:{type:GraphQLString},
        email:{type:GraphQLString},
        age:{type:GraphQLInt}
    }
})

export type HIuser = HydratedDocument<IUser>;
