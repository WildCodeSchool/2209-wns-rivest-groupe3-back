import { DataSource } from 'typeorm'
import { User } from './entities/User'
import { Blog } from './entities/Blog'
import { Article } from './entities/Article'
import { Content } from './entities/Content'
import { Comment } from './entities/Comment'

const dataSource = new DataSource({
  type: 'postgres',
  host: 'db',
  port: 5432,
  username: 'postgres',
  password: 'example',
  database: 'postgres',
  synchronize: true,
  entities: [User, Blog, Article, Content, Comment],
  logging: ['error'],
})

export default dataSource
