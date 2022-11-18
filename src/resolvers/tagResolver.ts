import { Arg, Mutation, Resolver } from 'type-graphql'
import dataSource from '../utils'
import { Tag } from '../entities/Tag'

@Resolver(Tag)
export class TagResolver {
  @Mutation(() => Tag)
  async createTag(@Arg('name') name: string): Promise<Tag> {
    try {
      const newTag = new Tag()
      newTag.name = name
      const newTagFromDb = await dataSource.manager.save(newTag)
      return newTagFromDb
    } catch (error) {
      throw new Error('Something wen wrong')
    }
  }
}
