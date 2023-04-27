import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql'
import dataSource from '../utils'
import { SubscriptionUserBlog } from '../entities/SubscriptionUserBlog'
import { User } from '../entities/User'
import { Blog } from '../entities/Blog'

@Resolver(SubscriptionUserBlog)
export class SubsciptionUserBlogResolver {
  @Query(() => [SubscriptionUserBlog])
  async getSubscriptions(): Promise<SubscriptionUserBlog[]> {
    return await dataSource.manager.find(SubscriptionUserBlog, {
      relations: {
        blog: true,
        user: true
      },
    })
  }

  @Authorized()
  @Mutation(() => SubscriptionUserBlog)
  async subscribeToBlog(
    @Ctx() context: { userFromToken: { userId: string } },
    @Arg('blogId') blogId: string
  ): Promise<SubscriptionUserBlog> {
    try {
      const newSubscription = new SubscriptionUserBlog()
      newSubscription.createdAt = new Date()

      const user = await dataSource.manager.findOneBy(User, {
        id: context.userFromToken.userId,
      })

      const existedSubription = await dataSource.manager.findOneBy(
        SubscriptionUserBlog,
        {
          user: {
            id: context.userFromToken.userId,
          },
          blog: {
            id: blogId,
          },
        }
      )
      if (existedSubription != null) throw new Error('Blog déjà suivi')

      if (user != null) newSubscription.user = user
      const blog = await dataSource.manager.findOneBy(Blog, {
        id: blogId,
      })
      if (blog !== null) newSubscription.blog = blog

      const newSubscriptionFromDb = await dataSource.manager.save(
        SubscriptionUserBlog,
        newSubscription
      )
      return newSubscriptionFromDb
    } catch (error) {
      console.error(error)
      throw new Error('Something went wrong')
    }
  }

  @Authorized()
  @Mutation(() => String)
  async unsubscribeToBlog(
    @Ctx() context: { userFromToken: { userId: string } },
    @Arg('blogId') blogId: string,
    @Arg('subscribeId') subscribeId: string
  ): Promise<string> {
    try {
      const { userFromToken } = context

      const subscribeToDelete = await dataSource.manager.findOneOrFail(
        SubscriptionUserBlog,
        {
          where: {
            id: subscribeId,
          },
          relations: {
            user: true,
            blog: true,
          },
        }
      )

      if (
        userFromToken.userId !== subscribeToDelete.user.id ||
        blogId !== subscribeToDelete.blog.id
      ) {
        throw new Error('You are not allowed to unsubscribe')
      }
      await dataSource.manager.delete(SubscriptionUserBlog, subscribeToDelete)

      return 'Blog was unsubscribed successfully !'
    } catch (error) {
      throw new Error('Something went wrong')
    }
  }
}
