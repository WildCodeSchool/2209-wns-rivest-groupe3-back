import 'reflect-metadata'
import { ApolloServer } from 'apollo-server'
import datasource from './utils'

const port = 5000

const typeDefs = `#graphql
  type Book {
    title: String
    author: String
  }
  type Query {
    books: [Book]
  }
`

const books = [
    {
        title: 'The Awakening',
        author: 'Kate Chopin',
    },
    {
        title: 'City of Glass',
        author: 'Paul Auster',
    },
]
const resolvers = {
    Query: {
        books: () => books,
    },
}

const start = async (): Promise<void> => {
    await datasource.initialize()
    const server = new ApolloServer({
        typeDefs,
        resolvers,
    })

    try {
        const { url }: { url: string } = await server.listen({ port })
        console.log(`🚀  Server ready at ${url}`)
    } catch (error) {
        console.error('Error starting the server')
    }
}

void start()
