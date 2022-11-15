import { DataSource } from 'typeorm'

const dataSource = new DataSource({
	type: 'postgres',
	host: 'db',
	port: 5432,
	username: 'postgres',
	password: 'example',
	database: 'postgres',
	synchronize: true,
	logging: ['error'],
})

export default dataSource