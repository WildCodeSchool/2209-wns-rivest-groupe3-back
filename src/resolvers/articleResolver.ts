import { Arg, Mutation, Resolver } from 'type-graphql'
import dataSource from '../utils'
import { Blog } from '../entities/Blog'
import { Article } from '../entities/Article'
import { Content } from '../entities/Content'

@Resolver(Article)
export class ArticleResolver {
  @Mutation(() => Article)
  async createArticle(
    @Arg('blogId') blogId: number,
    @Arg('show') show: boolean,
    @Arg('version') version: number,
    @Arg('content') content: string,
    @Arg('postedAt') postedAt: Date,
    @Arg('country', { nullable: true }) country: string
  ): Promise<Article> {
    try {
      const newArticle = new Article()
      newArticle.show = show
      newArticle.country = country
      newArticle.version = version
      newArticle.postedAt = postedAt

      const newContent = new Content()
      newContent.version = version
      newContent.content = content
      const savedContent = await dataSource.manager.save(newContent)

      newArticle.content = [savedContent]

      const blog = await dataSource.manager.findOneByOrFail(Blog, {
        id: blogId,
      })
      newArticle.blog = blog

      const newArticleFromDb = await dataSource.manager.save(newArticle)
      return newArticleFromDb
    } catch (error) {
      console.log(error)
      throw new Error('Something went wrong')
    }
  }
}
