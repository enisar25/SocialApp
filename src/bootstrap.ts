import express, {type Request, type Response, type NextFunction } from "express";
import { IError } from "./utils/AppError";
import router from "./modules/routes";
import { connectDB } from "./DB/config/connectDB";
import cors from "cors"
import initGateway from "./gateway/gateway";
import { GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";
const app = express();

const bootstrap = async () => {
    app.use(express.json());
    app.use(cors());
    app.use("/api/v1", router);
    const port = process.env.PORT || 3000;

    const dchema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name:'mainQuery',
        fields:{
          hello:{
            type:GraphQLString,
            resolve: ()=>{
              return 'hello'
            }
          }
        }
      }),
    })


    //Connect to Database
    await connectDB(process.env.DB_HOST as string);

   //Error handling middleware 
    app.use((err:IError, req:Request, res:Response, next:NextFunction) => {
    res.status(err.statusCode || 500).json({
      name: err.name,
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode || 500,
    });
  });

  const httpServer = app.listen(port, () => {
    console.log("Server is running on port 3000");
  });

  initGateway(httpServer);

};  

export default bootstrap;