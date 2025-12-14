import { GraphQLList, GraphQLNonNull, GraphQLString } from "graphql"
import { hello, me } from "./user.graphql.services"
import { GraphQlUserType } from "./user.types"

export const userQuery ={
    
          hello:{
            type:GraphQLString,
            args:{
              name:{
                type:new GraphQLNonNull(GraphQLString) 
              }
            },
            resolve: hello
          },

            me:{
            type: GraphQlUserType,
            resolve: me
          }

}

export const mutation ={

}