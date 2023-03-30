import * as dotenv from 'dotenv'
import * as path from 'path'
import { DataSource } from 'typeorm'

dotenv.config()

const username = process.env.PGUSER
const password = process.env.POSTGRES_PASSWORD

let host: { address: string; port: number }
switch (process.env.NODE_ENV) {
  case 'test':
    host = {
      address: 'db-test',
      port: 5433,
    }
    break
  case 'development':
    host = {
      address: 'dev-db',
      port: 5432,
    }
    break
  case 'staging':
    host = {
      address: 'stg-db',
      port: 5432,
    }
    break
  default:
    host = {
      address: 'db',
      port: 5432,
    }
    break
}

const dataSource = new DataSource({
  type: 'postgres',
  host: host.address,
  port: host.port,
  username,
  password,
  database: 'postgres',
  synchronize: false,
  entities: [path.join(__dirname, './entities/*.*')],
  migrations: [path.join(__dirname, '/migrations/*.*')],
  logging: ['error'],
})

export default dataSource
