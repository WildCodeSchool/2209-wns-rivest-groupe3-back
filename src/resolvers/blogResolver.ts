import { Arg, Mutation, Resolver } from 'type-graphql'
import dataSource from '../utils'
import { Blog } from '../entities/Blog'
import { User } from '../entities/User'

@Resolver(Blog)
export class BlogResolver {
  @Mutation(() => Blog)
  async createBlog(
    @Arg('name') name: string,
    @Arg('description') description: string,
    @Arg('userId') userId: number,
    @Arg('template', { nullable: true }) template?: string
  ): Promise<Blog> {
    // TODO : Get user from token
    const user = await dataSource.manager.findOneByOrFail(User, { id: userId })
    const newBlog = new Blog()
    newBlog.name = name
    newBlog.description = description
    newBlog.user = user
    newBlog.template = template === null ? template : 0
    const newBlogFromDb = await dataSource.manager.save(newBlog)

    if (user.blogs !== undefined && user.blogs.length > 0) {
      user.blogs = [...user.blogs, newBlog]
    } else {
      user.blogs = [newBlog]
    }
    await dataSource.manager.save(user)

    return newBlogFromDb
  }
}
