import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql'
import dataSource from '../utils'
import { Blog } from '../entities/Blog'
import { User } from '../entities/User'
import slugify from 'slugify'
import { slugifyOptions } from '../config/slugifyOptions'

@Resolver(Blog)
export class BlogResolver {
  @Query(() => Blog)
  async getBlog(@Arg('slug') slug: string): Promise<Blog> {
    try {
      const blog = await dataSource.manager.findOneOrFail(Blog, {
        where: {
          slug,
          articles: { articleContent: { current: true } },
        },
        relations: {
          user: {
            blogs: true,
          },
          articles: { articleContent: true },
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
          user: {
            blogs: true,
          },
        },
      })
      return blogs
    } catch (error) {
      console.error(error)
      throw new Error('Something went wrong')
    }
  }

  @Authorized()
  @Mutation(() => Blog)
  async createBlog(
    @Ctx() context: { userFromToken: { userId: string; email: string } },
    @Arg('name') name: string,
    @Arg('description') description: string,
    @Arg('template', { nullable: true }) template?: number
  ): Promise<Blog> {
    try {
      const {
        userFromToken: { userId },
      } = context
      const user = await dataSource.manager.findOneOrFail(User, {
        where: { id: userId },
        relations: { blogs: true },
      })
      const newBlog = new Blog()
      newBlog.name = name
      const baseSlug = slugify(name, slugifyOptions)
      let newSlug = baseSlug

      let i = 0
      let blogExists = true
      while (blogExists) {
        const dataSlug = await dataSource.manager.findOne(Blog, {
          where: { slug: newSlug },
        })
        if (dataSlug != null) {
          i++
          newSlug = `${baseSlug}_${i}`
        } else {
          blogExists = false
        }
      }
      newBlog.slug = newSlug
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
