import * as dotenv from 'dotenv'
import * as path from 'path'
import { DataSource } from 'typeorm'

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
  synchronize: false,
  entities: [path.join(__dirname, './entities/*.ts')],
  migrations: [path.join(__dirname, '/migrations/*.ts')],
  logging: ['error'],
})

export default dataSource
