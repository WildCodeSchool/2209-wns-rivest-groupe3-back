import {
  Arg,
  Args,
  ArgsType,
  Authorized,
  Ctx,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
} from 'type-graphql'
import dataSource from '../utils'
import { Blog } from '../entities/Blog'
import { Article } from '../entities/Article'
import { Content } from '../entities/Content'
import slugify from 'slugify'
import { slugifyOptions } from '../config/slugifyOptions'
import { IContext } from '../interfaces/interfaces'

@InputType()
class IContentBlockDataItemImageFile {
  @Field()
  url: string
}
@InputType()
class IContentBlockDataItemImage {
  @Field({ nullable: true })
  caption?: string

  @Field({ nullable: true })
  file?: IContentBlockDataItemImageFile

  @Field({ nullable: true })
  stretched?: boolean

  @Field({ nullable: true })
  withBackground?: boolean

  @Field({ nullable: true })
  withBorder?: boolean
}

@InputType()
class IContentBlockData extends IContentBlockDataItemImage {
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
export class IContentType {
  @Field()
  time: number

  @Field()
  version: string

  @Field((type) => [IContentBlock])
  blocks: IContentBlock[]
}
@ArgsType()
class NewArticleArgs {
  @Field()
  blogId: string

  @Field()
  title: string

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

@ArgsType()
class UpdateArticleArgs extends NewArticleArgs {
  @Field()
  articleId: string

  @Field({ nullable: true })
  coverUrl: string
}

@ArgsType()
class DeleteArticleArgs {
  @Field()
  articleId: string

  @Field()
  blogId: string
}

@Resolver(Article)
export class ArticleResolver {
  @Authorized()
  @Mutation(() => Article)
  async createArticle(
    @Ctx() context: { userFromToken: { userId: string; email: string } },
    @Args()
    {
      blogId,
      title,
      show,
      version,
      postedAt,
      country,
      articleContent,
    }: NewArticleArgs
  ): Promise<Article> {
    try {
      const {
        userFromToken: { userId },
      } = context
      const blog = await dataSource.manager.findOneOrFail(Blog, {
        where: { id: blogId },
        relations: {
          user: true,
        },
      })
      if (blog.user.id !== userId) {
        throw new Error('You are not authorized to update this blog.')
      }
      const articleTitleAlreadyExists = await dataSource.manager.find(Article, {
        where: {
          slug: slugify(title, slugifyOptions),
          blog: { id: blog.id },
        },
      })
      if (articleTitleAlreadyExists.length > 0)
        throw new Error(
          'An article with this title already exists in this blog.\n Consider changing the title or updating existing one'
        )

      const newArticle = new Article()
      newArticle.title = title
      newArticle.slug = slugify(title, slugifyOptions)
      newArticle.show = show
      newArticle.country = country
      newArticle.version = version
      newArticle.postedAt = postedAt === undefined ? new Date() : postedAt

      const newContent = new Content()
      newContent.version = version
      newContent.content = articleContent

      const savedContent = await dataSource.manager.save(newContent)
      newArticle.articleContent = [savedContent]

      newArticle.blog = blog

      const newArticleFromDb = await dataSource.manager.save(newArticle)
      return newArticleFromDb
    } catch (error: any) {
      console.log(error)
      throw new Error(error)
    }
  }

  @Query(() => Article)
  async getOneArticle(
    @Ctx() context: IContext,
    @Arg('slug') slug: string,
    @Arg('blogSlug') blogSlug: string,
    @Arg('allVersions', { nullable: true }) allVersions?: boolean
  ): Promise<Article> {
    try {
      const blog = await dataSource.manager.findOneOrFail(Blog, {
        relations: { user: true },
        where: { slug: blogSlug },
      })
      // Early exit if no user or user isn't owner of blog
      if (
        context?.userFromToken === undefined ||
        context.userFromToken.userId !== blog.user.id
      ) {
        return await dataSource.manager.findOneOrFail(Article, {
          relations: {
            articleContent: true,
            comments: {
              user: true,
            },
          },
          where: {
            slug,
            blog: { id: blog.id },
            show: true,
            articleContent: { current: true },
          },
        })
      }

      if (allVersions !== undefined && allVersions) {
        return await dataSource.manager.findOneOrFail(Article, {
          relations: {
            articleContent: true,
            comments: {
              user: true,
            },
          },
          where: { slug, blog: { id: blog.id } },
          order: { articleContent: { version: 'asc' } },
        })
      }

      return await dataSource.manager.findOneOrFail(Article, {
        relations: {
          articleContent: true,
          comments: {
            user: true,
          },
        },
        where: {
          slug,
          blog: { id: blog.id },
          articleContent: { current: true },
        },
      })
    } catch (error) {
      console.error(error)
      throw new Error('Article not found')
    }
  }

  @Query(() => [Article])
  async getAllArticles(
    @Arg('limit', { nullable: true }) limit?: number,
    @Arg('offset', { nullable: true }) offset?: number,
    @Arg('version', { nullable: true }) version?: number
  ): Promise<Article[]> {
    try {
      const articles = await dataSource.manager.find(Article, {
        where: {
          show: true,
          version,
          articleContent: { current: true },
        },
        relations: {
          articleContent: true,
          blog: {
            user: true,
          },
        },
        take: limit,
        skip: offset,
      })
      return articles
    } catch (error) {
      throw new Error('Article not found')
    }
  }

  @Query(() => Number)
  async getNumberOfArticles(): Promise<number> {
    try {
      const count = await dataSource.manager.count(Article, {
        where: { show: true },
      })
      return count
    } catch (err) {
      console.log(err)
      throw new Error('Could not retreive number of articles')
    }
  }

  @Authorized()
  @Mutation(() => Article)
  async updateArticle(
    @Ctx() context: IContext,
    @Args()
    {
      articleId,
      blogId,
      coverUrl,
      title,
      show,
      version,
      country,
      articleContent,
    }: UpdateArticleArgs
  ): Promise<Article> {
    try {
      if (context?.userFromToken === undefined)
        throw new Error('You are not authorized to update this article=.')
      const {
        userFromToken: { userId },
      } = context
      const blog = await dataSource.manager.findOneOrFail(Blog, {
        where: { id: blogId },
        relations: {
          user: true,
        },
      })
      if (blog.user.id !== userId) {
        throw new Error('You are not authorized to update this article.')
      }
      const article = await dataSource.manager.findOneOrFail(Article, {
        where: { id: articleId },
        relations: {
          articleContent: true,
        },
      })

      // If article.show from db is false, and incoming update sets article.show to true,
      // it would mean that user is changing status from unpublished to publish,
      // so we must set postedAt to now
      article.postedAt = !article.show && show ? new Date() : article.postedAt

      article.show = show
      article.country = country !== undefined ? country : article.country
      article.coverUrl = coverUrl

      // If incoming version is different than db, then article version has been updated, or user has chosen to display previous version
      if (article.version !== version) {
        // start by setting all previous content.current to false
        await dataSource.manager.save(
          article.articleContent.map((existingContent) => {
            existingContent.current = false
            return existingContent
          })
        )

        const newContent = new Content()
        newContent.version = version
        newContent.content = articleContent
        newContent.current = true
        newContent.article = article

        const savedContent = await dataSource.manager.save(newContent)

        // Add new content to array of content versions
        article.articleContent.push(savedContent)

        article.version = version
      }

      const existingContentVersion = article.articleContent.filter(
        (content) => content.version === version
      )[0]
      existingContentVersion.content = articleContent
      existingContentVersion.current = true
      await dataSource.manager.save(existingContentVersion)

      if (article.title !== title) {
        const articleTitleAlreadyExists = await dataSource.manager.find(
          Article,
          {
            where: {
              slug: slugify(title, slugifyOptions),
              blog: { id: blog.id },
            },
          }
        )
        if (articleTitleAlreadyExists.length > 0)
          throw new Error(
            'An article with this title already exists in this blog.\n Consider changing the title or updating existing one'
          )
        article.title = title
        article.slug = slugify(title, slugifyOptions)
      }

      // Save updated article to db
      await dataSource.manager.save(article)

      // Query db again and filter out content to current === true only
      const updated = await dataSource.manager.findOneOrFail(Article, {
        relations: { articleContent: true },
        where: {
          articleContent: { current: true },
          id: articleId,
        },
      })
      return updated
    } catch (error: any) {
      console.error(error)
      throw new Error(error)
    }
  }

  @Authorized()
  @Mutation(() => String)
  async deleteArticle(
    @Ctx() context: { userFromToken: { userId: string; email: string } },
    @Args() { articleId, blogId }: DeleteArticleArgs
  ): Promise<string> {
    try {
      const {
        userFromToken: { userId },
      } = context
      const blog = await dataSource.manager.findOneOrFail(Blog, {
        where: { id: blogId },
        relations: {
          user: true,
        },
      })
      if (blog.user.id !== userId) {
        throw new Error('You are not authorized to update this blog.')
      }
      const article = await dataSource.manager.findOneOrFail(Article, {
        where: { id: articleId },
      })
      await dataSource.manager.delete(Article, article.id)
      return 'Article deleted successfully'
    } catch (error: any) {
      console.error(error)
      throw new Error(error)
    }
  }
}
