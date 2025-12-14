import { graphqlAuth } from "../../middleware/authorization"
import { graphqlValidation } from "../../middleware/validation"
import { helloSchema } from "./user.validation"

export const hello = async(_:any,args:any,ctx:any)=>{
  return 'hello ' + args.name
}

export const me = async(_:any,args:any,ctx:any)=>{
  const user = await graphqlAuth(ctx.authorization)
  console.log(user)
  return user
}

