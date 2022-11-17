import 'reflect-metadata'
import { ApolloServer } from 'apollo-server'
import { buildSchema } from 'type-graphql'
import datasource from './utils'
import { UserResolver } from './resolvers/userResolver'
import { BlogResolver } from './resolvers/blogResolver'
import { ArticleResolver } from './resolvers/articleResolver'
import { CommentResolver } from './resolvers/commentResolver'
import { CategoryResolver } from './resolvers/categoryResolver'
import { TagResolver } from './resolvers/tagResolver'

const port = 5000

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
  })
  const server = new ApolloServer({ schema })

  try {
    const { url }: { url: string } = await server.listen({ port })
    console.log(`🚀  Server ready at ${url}`)
  } catch (error) {
    console.error('Error starting the server')
  }
}

void start()
