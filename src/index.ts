import 'reflect-metadata'
import { ApolloServer } from 'apollo-server'
import { buildSchema } from 'type-graphql'
import dataSource from './utils'
import jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config()

const port = process.env.PORT ?? 5000

const start = async (): Promise<void> => {
  await dataSource.initialize()
  await dataSource.runMigrations()
  const schema = await buildSchema({
    resolvers: [path.join(__dirname, './resolvers/*.*')],
    authChecker: ({ context }) => {
      const { userFromToken: { email } = { email: null } } = context
      if (email === null) return false
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
            const userFromToken = jwt.verify(bearer, process.env.JWT_SECRET_KEY)
            return { userFromToken }
          } else {
            return {}
          }
        } catch (err) {
          console.error(err)
          return {}
        }
      }
    },
    csrfPrevention: true,
    cors: { origin: '*', credentials: true },
  })

  try {
    const { url }: { url: string } = await server.listen({ port })
    console.log(`🚀  Server ready at ${url}`)
  } catch (error) {
    console.error('Error starting the server')
  }
}

void start()
