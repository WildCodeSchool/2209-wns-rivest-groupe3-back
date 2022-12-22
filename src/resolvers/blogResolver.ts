import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql'
import dataSource from '../utils'
import { Blog } from '../entities/Blog'
import { User } from '../entities/User'

@Resolver(Blog)
export class BlogResolver {
  @Query(() => Blog)
  async getBlog(@Arg('blogId') blogId: string): Promise<Blog> {
    try {
      const blog = await dataSource.manager.findOneOrFail(Blog, {
        where: {
          id: blogId,
        },
        relations: {
          articles: {
            articleContent: true,
          },
        },
      })
      return blog
    } catch (error) {
      throw new Error('Something went wrong')
    }
  }

  @Query(() => [Blog])
  async getAllBlogs(): Promise<Blog[]> {
    try {
      const blogs = await dataSource.manager.find(Blog, {
        relations: {
          articles: {
            articleContent: true,
          },
        },
      })
      return blogs
    } catch (error) {
      throw new Error('Something went wrong')
    }
  }

  @Authorized()
  @Mutation(() => Blog)
  async createBlog(
    @Ctx() context: { userId: string; email: string },
    @Arg('name') name: string,
    @Arg('description') description: string,
    @Arg('template', { nullable: true }) template?: number
  ): Promise<Blog> {
    try {
      const { userId } = context
      const user = await dataSource.manager.findOneByOrFail(User, {
        id: userId,
      })
      const newBlog = new Blog()
      newBlog.name = name
      newBlog.description = description
      newBlog.user = user
      newBlog.template = template === null ? template : 0
      const newBlogFromDb = await dataSource.manager.save(newBlog)

      if (user.blogs !== undefined && user.blogs.length > 0) {
        user.blogs = [...user.blogs, newBlogFromDb]
      } else {
        user.blogs = [newBlogFromDb]
      }
      await dataSource.manager.save(user)

      return newBlogFromDb
    } catch (error) {
      console.log(error)
      throw new Error('Something went wrong')
    }
  }
}
