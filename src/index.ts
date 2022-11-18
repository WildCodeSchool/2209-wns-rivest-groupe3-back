import 'reflect-metadata'
import { ApolloServer } from 'apollo-server'
import { buildSchema } from 'type-graphql'
import datasource from './utils'
import jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'
import { UserResolver } from './resolvers/userResolver'
import { BlogResolver } from './resolvers/blogResolver'
import { ArticleResolver } from './resolvers/articleResolver'
import { CommentResolver } from './resolvers/commentResolver'
import { CategoryResolver } from './resolvers/categoryResolver'
import { TagResolver } from './resolvers/tagResolver'

dotenv.config()

const port = process.env.PORT ?? 5000

const start = async (): Promise<void> => {
  await datasource.initialize()
  const schema = await buildSchema({
resolvers: [
  UserResolver,
  BlogResolver,
  ArticleResolver,
  CommentResolver,
  CategoryResolver,
  TagResolver,
],
    authChecker: ({ context }) => {
      if (context.email === undefined) return false
      else return true
    },
  })
  const server = new ApolloServer({
    schema,
    context: ({ req }) => {
      if (
        req.headers.authorization === undefined ||
        process.env.JWT_SECRET_KEY === undefined
      )
        return {}
      else {
        try {
          const bearer = req.headers.authorization
          if (bearer.length > 0) {
            const user = jwt.verify(bearer, process.env.JWT_SECRET_KEY)
            return user
          } else {
            return {}
          }
        } catch (err) {
          console.error(err)
          return {}
        }
      }
    },
  })

  try {
    const { url }: { url: string } = await server.listen({ port })
    console.log(`🚀  Server ready at ${url}`)
  } catch (error) {
    console.error('Error starting the server')
  }
}

void start()
