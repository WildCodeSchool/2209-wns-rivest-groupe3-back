import 'reflect-metadata'
import { ApolloServer } from 'apollo-server'
import { buildSchema } from 'type-graphql'
import { UserResolver } from './resolvers/userResolver'
import datasource from './utils'
import { BlogResolver } from './resolvers/blogResolver'

const port = 5000

const start = async (): Promise<void> => {
  await datasource.initialize()
  const schema = await buildSchema({ resolvers: [UserResolver, BlogResolver] })
  const server = new ApolloServer({ schema })

  try {
    const { url }: { url: string } = await server.listen({ port })
    console.log(`🚀  Server ready at ${url}`)
  } catch (error) {
    console.error('Error starting the server')
  }
}

void start()
