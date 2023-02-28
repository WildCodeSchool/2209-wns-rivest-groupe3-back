import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql'
import dataSource from '../utils'
import { Blog } from '../entities/Blog'
import { User } from '../entities/User'
import slugify from 'slugify'

@Resolver(Blog)
export class BlogResolver {
  @Query(() => Blog)
  async getBlog(@Arg('slug') slug: string): Promise<Blog> {
    try {
      const blog = await dataSource.manager.findOneOrFail(Blog, {
        where: {
          slug,
        },
        relations: {
          user: {
            blogs: true,
          },
          articles: true,
        },
      })
      return blog
    } catch (error) {
      throw new Error('Something went wrong')
    }
  }

  @Query(() => [Blog])
  async getAllBlogs(
    @Arg('limit', { nullable: true }) limit?: number,
    @Arg('offset', { nullable: true }) offset?: number
  ): Promise<Blog[]> {
    try {
      const blogs = await dataSource.manager.find(Blog, {
        relations: {
          user: {
            blogs: true,
          },
          articles: true,
        },
        take: limit,
        skip: offset,
      })

      return blogs
    } catch (error) {
      console.error(error)
      throw new Error('Something went wrong')
    }
  }

  @Query(() => Number)
  async getNumberOfBlogs(): Promise<number> {
    try {
      const blogs = await dataSource.manager.find(Blog)
      return blogs.length
    } catch (err) {
      console.log(err)
      throw new Error('Could not retreive number of blogs')
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
      const baseSlug = slugify(name, {
        replacement: '-',
        remove: undefined,
        lower: true,
        strict: false,
        locale: 'vi',
        trim: true,
      })
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
