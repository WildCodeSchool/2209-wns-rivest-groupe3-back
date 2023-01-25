import testDataSource from './testDatasource'
import { User } from '../entities/User'
import { Blog } from '../entities/Blog'
import { Article } from '../entities/Article'
import { Content } from '../entities/Content'
import { Comment } from '../entities/Comment'
import { Category } from '../entities/Category'
import { Tag } from '../entities/Tag'

const allEntities = [User, Blog, Article, Content, Comment, Category, Tag]

const clearAllEntities = async (): Promise<any> => {
  await testDataSource.initialize()
  await Promise.all(
    allEntities.map(
      async (entity) =>
        await testDataSource.manager
          .createQueryBuilder(entity, entity.name)
          .delete()
          .execute()
    )
  )
  await testDataSource.destroy()
}

export default clearAllEntities
