import { Arg, Mutation, Resolver } from 'type-graphql'
import { Article } from '../entities/Article'
import { Comment } from '../entities/Comment'
import dataSource from '../utils'

@Resolver(Comment)
export class CommentResolver {
  @Mutation(() => Comment)
  async commentArticle(
    @Arg('content') content: string,
    @Arg('articleId') articleId: number
  ): Promise<Comment> {
    try {
      const newComment = new Comment()
      newComment.content = content
      const article = await dataSource.manager.findOneByOrFail(Article, {
        id: articleId,
      })
      newComment.article = article

      const newCommentFromDB = await dataSource.manager.save(newComment)
      return newCommentFromDB
    } catch (error) {
      console.log(error)
      throw new Error('Something went wrong')
    }
  }
}
