import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql';
import {  userQuery } from '../userModule/user.graphql.controller';
    
    export  const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name:'mainQuery',
        fields:{
            ...userQuery

        }
      }),
    })