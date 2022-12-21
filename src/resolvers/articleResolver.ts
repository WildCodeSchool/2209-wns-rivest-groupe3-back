import {
  Args,
  ArgsType,
  Authorized,
  Ctx,
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
  @Field((type) => String)
  blogId: string

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
  @Authorized()
  @Mutation(() => Article)
  async createArticle(
    @Ctx() context: { userId: string; email: string },
    @Args()
    { blogId, show, version, postedAt, country, articleContent }: NewArticleArgs
  ): Promise<Article> {
    try {
      const blog = await dataSource.manager.findOneByOrFail(Blog, {
        id: blogId,
      })
      if (blog.user.id !== context.userId) {
        throw new Error('You are not authorized to update this blog..')
      }
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

      newArticle.blog = blog

      const newArticleFromDb = await dataSource.manager.save(newArticle)
      return newArticleFromDb
    } catch (error) {
      console.log(error)
      throw new Error('Something went wrong')
    }
  }
}
