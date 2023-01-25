import * as dotenv from 'dotenv'
import { DataSource } from 'typeorm'
import { User } from './entities/User'
import { Blog } from './entities/Blog'
import { Article } from './entities/Article'
import { Content } from './entities/Content'
import { Comment } from './entities/Comment'
import { Category } from './entities/Category'
import { Tag } from './entities/Tag'

dotenv.config()

const dbHost = process.env.NODE_ENV === 'test' ? 'db-test' : 'db'
const dbPort = process.env.NODE_ENV === 'test' ? 5433 : 5432

const dataSource = new DataSource({
  type: 'postgres',
  host: dbHost,
  port: dbPort,
  username: 'postgres',
  password: 'example',
  database: 'postgres',
  synchronize: true,
  entities: [User, Blog, Article, Content, Comment, Category, Tag],
  logging: ['error'],
})

export default dataSource
