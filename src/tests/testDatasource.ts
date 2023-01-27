import { DataSource } from 'typeorm'
import { User } from '../entities/User'
import { Blog } from '../entities/Blog'
import { Article } from '../entities/Article'
import { Content } from '../entities/Content'
import { Comment } from '../entities/Comment'
import { Category } from '../entities/Category'
import { Tag } from '../entities/Tag'

const testDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'example',
  database: 'postgres',
  synchronize: true,
  entities: [User, Blog, Article, Content, Comment, Category, Tag],
  logging: ['error'],
})

export default testDataSource
