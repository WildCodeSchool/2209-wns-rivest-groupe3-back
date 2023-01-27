import * as path from 'path'
import { DataSource } from 'typeorm'

const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'example',
  database: 'postgres',
  synchronize: false,
  entities: [path.join(__dirname, '../entities/*.ts')],
  migrations: [path.join(__dirname, '../migrations/*.ts')],
  logging: ['error'],
})

export default dataSource
