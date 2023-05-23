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
      const blog = await dataSource.manager.findOne(Blog, {
        where: {
          slug,
        },
        relations: {
          user: {
            blogs: true,
          },
          articles: { articleContent: true },
          subscriptions: { user: true },
        },
      })
      if (blog === null) {
        throw new Error('Blog introuvable')
      }
      return blog
    } catch (error) {
      console.error(error)
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
          subscriptions: true,
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
      const count = await dataSource.getRepository(Blog).count()
      return count
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
      newBlog.template = template ?? 1
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

  @Authorized()
  @Mutation(() => Blog)
  async updateBlog(
    @Ctx() context: { userFromToken: { userId: string; email: string } },
    @Arg('blogSlug') blogSlug: string,
    @Arg('name', { nullable: true }) name?: string,
    @Arg('description', { nullable: true }) description?: string,
    @Arg('coverUrl', { nullable: true }) coverUrl?: string,
    @Arg('template', { nullable: true }) template?: number
  ): Promise<Blog> {
    try {
      const { userFromToken } = context
      const blogToUpdate = await dataSource.manager.findOneOrFail(Blog, {
        where: { slug: blogSlug },
        relations: {
          user: true,
        },
      })

      if (blogToUpdate.user.id !== userFromToken.userId) {
        throw new Error('You are not allowed to update this blog')
      }

      if (name !== undefined) {
        blogToUpdate.name = name

        const baseSlug = slugify(name, slugifyOptions)
        let newSlug = baseSlug

        if (newSlug !== blogSlug) {
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
          blogToUpdate.slug = newSlug
        }
      }

      if (description !== undefined) blogToUpdate.description = description
      if (coverUrl !== undefined) blogToUpdate.coverUrl = coverUrl
      if (template !== undefined) blogToUpdate.template = template

      await dataSource.manager.save(blogToUpdate)
      return blogToUpdate
    } catch (err) {
      console.log(err)
      throw new Error('Something went wrong')
    }
  }

  @Authorized()
  @Mutation(() => String)
  async deleteBlog(
    @Ctx() context: { userFromToken: { userId: string; email: string } },
    @Arg('blogSlug') blogSlug: string
  ): Promise<string> {
    try {
      const { userFromToken } = context

      const blogToDelete = await dataSource.manager.findOneOrFail(Blog, {
        where: {
          slug: blogSlug,
        },
        relations: {
          user: true,
        },
      })

      if (userFromToken.userId !== blogToDelete.user.id) {
        throw new Error('You are not allowed to delete this blog')
      }

      await dataSource.manager.delete(Blog, blogToDelete)
      return 'Blog was deleted successfully'
    } catch (err) {
      console.log(err)
      throw new Error('Something went wrong')
    }
  }
}
