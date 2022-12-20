import {
  Args,
  ArgsType,
  Field,
  InputType,
  Mutation,
  Resolver,
} from 'type-graphql'
import dataSource from '../utils'
import { Blog } from '../entities/Blog'
import { Article } from '../entities/Article'
import { Content } from '../entities/Content'

@InputType()
class IContentBlockData {
  @Field({ nullable: true })
  text?: string

  @Field({ nullable: true })
  level?: number

  @Field({ nullable: true })
  style?: string

  @Field((type) => [String], { nullable: true })
  items?: string[]
}
@InputType()
class IContentBlock {
  @Field()
  id: string

  @Field()
  type: string

  @Field((type) => IContentBlockData)
  data: IContentBlockData
}
@InputType()
class IContentType {
  @Field()
  time: number

  @Field()
  version: string

  @Field((type) => [IContentBlock])
  blocks: IContentBlock[]
}
@ArgsType()
class NewArticleArgs {
  @Field((type) => Number)
  blogId: number

  @Field()
  show: boolean

  @Field()
  version: number

  @Field({ nullable: true })
  postedAt: Date

  @Field({ nullable: true })
  country: string

  @Field()
  articleContent: IContentType
}

@Resolver(Article)
export class ArticleResolver {
  @Mutation(() => Article)
  async createArticle(
    @Args()
    { blogId, show, version, postedAt, country, articleContent }: NewArticleArgs
  ): Promise<Article> {
    try {
      const newArticle = new Article()
      newArticle.show = show
      newArticle.country = country
      newArticle.version = version
      newArticle.postedAt = postedAt !== null ? postedAt : new Date()

      const newContent = new Content()
      newContent.version = version
      newContent.content = articleContent
      const savedContent = await dataSource.manager.save(newContent)

      newArticle.articleContent = [savedContent]

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
