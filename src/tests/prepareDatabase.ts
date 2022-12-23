import testDataSource from './testDatasource'
import { User } from '../entities/User'
import { Blog } from '../entities/Blog'

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
  } catch (error) {
    console.log('testDataSource error: ', error)
  }
}

export { prepareUserTable, prepareBlogTable }
