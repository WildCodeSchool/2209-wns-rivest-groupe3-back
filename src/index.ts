import 'reflect-metadata'
import { ApolloServer } from 'apollo-server'
import { buildSchema } from 'type-graphql'
import { UserResolver } from './resolvers/userResolver'
import datasource from './utils'
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT ?? 5000;

const start = async (): Promise<void> => {
  await datasource.initialize()
  const schema = await buildSchema({ 
    resolvers: [UserResolver],
    authChecker: ({ context }) => {
      console.log("context", context)
      if(context.email  === undefined) return false
      else return true;
    }
  })
  const server = new ApolloServer({ 
    schema,
    context: ({ req }) => {
      if (
        req.headers.authorization === undefined ||
        process.env.JWT_SECRET_KEY === undefined
      ) return {};
      else {
        try {
          const bearer = req.headers.authorization;
          console.log(req.headers.authorization)
          if (bearer.length > 0) {
            const user = jwt.verify(bearer, process.env.JWT_SECRET_KEY);
            return user;
          } else {
            return {};
          }
        } catch (err) {
          console.error(err);
          return {};
        }
      }
    }
  })

  try {
    const { url }: { url: string } = await server.listen({ port })
    console.log(`🚀  Server ready at ${url}`)
  } catch (error) {
    console.error('Error starting the server')
  }
}

void start()
