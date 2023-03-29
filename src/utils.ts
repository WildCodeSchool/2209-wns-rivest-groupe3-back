import * as dotenv from 'dotenv'
import * as path from 'path'
import { DataSource } from 'typeorm'

dotenv.config()

const username = process.env.PGUSER
const password =
  process.env.NODE_ENV !== 'production'
    ? 'example'
    : process.env.POSTGRES_PASSWORD

const host = process.env.NODE_ENV === 'test' ? 'db-test' : 'db'
const port = process.env.NODE_ENV === 'test' ? 5433 : 5432

const dataSource = new DataSource({
  type: 'postgres',
  host,
  port,
  username,
  password,
  database: 'postgres',
  synchronize: false,
  entities: [path.join(__dirname, './entities/*.*')],
  migrations: [path.join(__dirname, '/migrations/*.*')],
  logging: ['error'],
})

export default dataSource
