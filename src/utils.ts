import { DataSource } from 'typeorm'
import { User } from './entities/User'

const dataSource = new DataSource({
  type: 'postgres',
  host: 'db',
  port: 5432,
  username: 'postgres',
  password: 'example',
  database: 'postgres',
  synchronize: true,
  entities: [User],
  logging: ['error'],
})

export default dataSource
