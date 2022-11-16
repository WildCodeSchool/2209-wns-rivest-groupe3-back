import 'reflect-metadata'
import { ApolloServer } from 'apollo-server'
import { buildSchema } from 'type-graphql'
import { UserResolver } from './resolvers/userResolver'
import datasource from './utils'

const port = 5000

const start = async (): Promise<void> => {
  await datasource.initialize()
  const schema = await buildSchema({ resolvers: [UserResolver] })
  const server = new ApolloServer({ schema })

  try {
    const { url }: { url: string } = await server.listen({ port })
    console.log(`🚀  Server ready at ${url}`)
  } catch (error) {
    console.error('Error starting the server')
  }
}

void start()
