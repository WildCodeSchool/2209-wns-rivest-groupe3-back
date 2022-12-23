import testDataSource from './testDatasource'
import { User } from '../entities/User'
import { Blog } from '../entities/Blog'
import * as argon2 from 'argon2'

const prepareUserTable = async (): Promise<void> => {
  await testDataSource.initialize()
  try {
    const testUser = await testDataSource.manager.findOneBy(User, {
      email: 'test-user@test.com',
    })
    if (testUser != null) {
      await testDataSource.manager.remove(testUser)
    }
  } catch (error) {
    console.log('testDataSource error: ', error)
  }
}

const prepareBlogTable = async (): Promise<void> => {
  await testDataSource.initialize()
  try {
    const testBlog = await testDataSource.manager.findOneBy(Blog, {
      name: 'My Test Blog',
    })
    if (testBlog != null) {
      await testDataSource.manager.remove(testBlog)
    }
    const testUser = await testDataSource.manager.findOneBy(User, {
      email: 'test-user@test.com',
    })
    if (testUser === null) {
      const newUser = new User()
      newUser.email = 'test-user@test.com'
      newUser.nickname = 'test'
      newUser.password = await argon2.hash('test')
      await testDataSource.manager.save(User, newUser)
    }
  } catch (error) {
    console.log('testDataSource error: ', error)
  }
}

const destroyConnection = async (): Promise<void> => {
  await testDataSource.destroy()
}

export { prepareUserTable, prepareBlogTable, destroyConnection }
