import { Arg, Mutation, Resolver } from 'type-graphql'
import dataSource from '../utils'
import { Category } from '../entities/Category'

@Resolver(Category)
export class CategoryResolver {
  @Mutation(() => Category)
  async createCategory(@Arg('name') name: string): Promise<Category> {
    try {
      const newCategory = new Category()
      newCategory.name = name
      const newCategoryFromDb = await dataSource.manager.save(newCategory)
      return newCategoryFromDb
    } catch (error) {
      throw new Error('Something wen wrong')
    }
  }
}
