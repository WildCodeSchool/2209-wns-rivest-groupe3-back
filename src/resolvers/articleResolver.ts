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
        throw new Error('You are not authorized to update this blog..')
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
    @Arg('slug') slug: string,
    @Arg('blogSlug') blogSlug: string,
    @Arg('version', { nullable: true }) version?: number,
    @Arg('allVersions', { nullable: true }) allVersions?: boolean,
    @Arg('current', { nullable: true }) current?: boolean
  ): Promise<Article> {
    try {
      const blog = await dataSource.manager.findOneOrFail(Blog, {
        where: { slug: blogSlug },
      })
      if (version !== undefined) {
        return await dataSource.manager.findOneOrFail(Article, {
          relations: { articleContent: true },
          where: {
            articleContent: { version },
            slug,
            blog: { id: blog.id },
            show: true,
          },
        })
      }
      if (current ?? false) {
        return await dataSource.manager.findOneOrFail(Article, {
          relations: { articleContent: true },
          where: {
            articleContent: { current: true },
            slug,
            blog: { id: blog.id },
            show: true,
          },
        })
      }
      if (allVersions ?? false) {
        return await dataSource.manager.findOneOrFail(Article, {
          relations: { articleContent: true },
          where: { slug, blog: { id: blog.id }, show: true },
          order: { articleContent: { version: 'asc' } },
        })
      }

      return await dataSource.manager.findOneOrFail(Article, {
        relations: { articleContent: true },
        where: {
          slug,
          blog: { id: blog.id },
          show: true,
          articleContent: { current: true },
        },
      })
    } catch (error) {
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
        relations: {
          articleContent: true,
        },
        where: {
          show: true,
          version,
          articleContent: { current: true },
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
    @Ctx() context: { userFromToken: { userId: string; email: string } },
    @Args()
    {
      articleId,
      blogId,
      title,
      show,
      version,
      country,
      articleContent,
    }: UpdateArticleArgs
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
        throw new Error('You are not authorized to update this blog..')
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

      // If incoming version is different than db, then article.content has been updated
      if (article.version !== version) {
        // start by setting previous content.current to false
        await dataSource.manager.update(
          Content,
          { id: article.articleContent[article.articleContent.length - 1].id },
          { current: false }
        )

        const newContent = new Content()
        newContent.version = version
        newContent.content = articleContent
        newContent.current = true

        const savedContent = await dataSource.manager.save(newContent)

        // Add new content to array of content versions
        article.articleContent.push(savedContent)
      }

      article.version = version !== undefined ? version : article.version
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
        throw new Error('You are not authorized to update this blog..')
      }
      const article = await dataSource.manager.findOneOrFail(Article, {
        where: { id: articleId },
      })
      await dataSource.manager.delete(Article, article)
      return 'Article deleted successfully'
    } catch (error: any) {
      console.error(error)
      throw new Error(error)
    }
  }
}
