import { Arg, Authorized, Ctx, Mutation, Resolver } from 'type-graphql'
import { Article } from '../entities/Article'
import { Comment } from '../entities/Comment'
import { User } from '../entities/User'
import dataSource from '../utils'

@Resolver(Comment)
export class CommentResolver {
  @Authorized()
  @Mutation(() => Comment)
  async commentArticle(
    @Ctx() context: { userId: string; email: string },
    @Arg('content') content: string,
    @Arg('articleId') articleId: string
  ): Promise<Comment> {
    try {
      const { userId } = context
      const user = await dataSource.manager.findOneByOrFail(User, {
        id: userId,
      })
      const newComment = new Comment()
      newComment.content = content
      const article = await dataSource.manager.findOneByOrFail(Article, {
        id: articleId,
      })
      newComment.article = article
      newComment.user = user

      const newCommentFromDB = await dataSource.manager.save(newComment)
      return newCommentFromDB
    } catch (error) {
      console.log(error)
      throw new Error('Something went wrong')
    }
  }
}
