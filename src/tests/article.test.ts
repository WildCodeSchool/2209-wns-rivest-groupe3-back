import client from './clientUtil'
import clearAllEntities from './setupDb'
import {
  CREATE_USER,
  GET_TOKEN,
  CREATE_BLOG,
  CREATE_ARTICLE,
  GET_ONE_ARTICLE,
  UPDATE_ARTICLE,
} from './gql'
import { IContentType } from '../resolvers/articleResolver'

const articleTestUserInfo = {
  email: 'article-test-user@test.com',
  password: 'test',
  nickname: 'article-test',
}
const articleTestUserInfo2 = {
  email2: 'article-test-user-2@test.com',
  password2: 'test',
  nickname2: 'article-test-2',
}

const articleContent: IContentType = {
  time: 1674731194,
  version: '2.26.5',
  blocks: [
    {
      id: 'oUq2g_tl8y',
      type: 'header',
      data: {
        text: 'Editor.js',
        level: 2,
      },
    },
  ],
}
const articleContentUpdate: IContentType = {
  time: 1674733194,
  version: '2.26.5',
  blocks: [
    {
      id: 'oUq2g_tl8y',
      type: 'header',
      data: {
        text: 'Title',
        level: 1,
      },
    },
  ],
}

const uuidRegex =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/

const timeStampStringRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/

describe('Article Resolver', () => {
  const { email, password, nickname } = articleTestUserInfo
  let token: string
  let blogId: string
  let blogSlug: string
  let articleSlug: string
  let articleId: string

  const { email2, password2, nickname2 } = articleTestUserInfo2
  let token2: string

  beforeAll(async () => {
    await clearAllEntities()
    await client.mutate({
      mutation: CREATE_USER,
      variables: {
        email,
        password,
        nickname,
      },
    })
    await client.mutate({
      mutation: CREATE_USER,
      variables: {
        email: email2,
        password: password2,
        nickname: nickname2,
      },
    })
    const tokenRes = await client.mutate({
      mutation: GET_TOKEN,
      variables: {
        email,
        password,
      },
    })
    token = tokenRes.data?.getToken.token
    const blog = await client.mutate({
      mutation: CREATE_BLOG,
      variables: {
        name: 'Article Blog',
        description: 'A blog for article resolver testing',
      },
      context: {
        headers: {
          authorization: token,
        },
      },
    })
    blogId = blog.data?.createBlog.id
    blogSlug = blog.data?.createBlog.slug

    const tokenRes2 = await client.mutate({
      mutation: GET_TOKEN,
      variables: {
        email: email2,
        password: password2,
      },
    })
    token2 = tokenRes2.data?.getToken.token
  })

  it('Creates a new article', async () => {
    const res = await client.mutate({
      mutation: CREATE_ARTICLE,
      variables: {
        blogId,
        title: 'Test article',
        show: true,
        version: 1,
        articleContent,
      },
      context: {
        headers: {
          authorization: token,
        },
      },
    })
    articleId = res.data?.createArticle.id
    articleSlug = res.data?.createArticle.slug
    expect(res.data?.createArticle.id).toMatch(uuidRegex)
    expect(res.data?.createArticle.title).toBe('Test article')
    expect(res.data?.createArticle.createdAt).toMatch(timeStampStringRegex)
    expect(res.data?.createArticle.postedAt).toMatch(timeStampStringRegex)
    expect(res.data?.createArticle.articleContent).toBeDefined()
  })

  it('Fails to create article without token', async () => {
    const res = await client.mutate({
      mutation: CREATE_ARTICLE,
      variables: {
        blogId,
        title: 'Test article',
        show: true,
        version: 1,
        articleContent,
      },
    })
    const errorMessage = res.errors?.[0]?.message
    expect(res.errors).toHaveLength(1)
    expect(errorMessage).toBe(
      'Access denied! You need to be authorized to perform this action!'
    )
  })

  it('Fails to create article if blog does not belong to user', async () => {
    const res = await client.mutate({
      mutation: CREATE_ARTICLE,
      variables: {
        blogId,
        title: 'Test article',
        show: true,
        version: 1,
        articleContent,
      },
      context: {
        headers: {
          authorization: token2,
        },
      },
    })
    const errorMessage = res.errors?.[0]?.message
    expect(res.errors).toHaveLength(1)
    expect(errorMessage).toBe(
      'Error: You are not authorized to update this blog..'
    )
  })

  it('Updates an Article, refetches it and should be updated', async () => {
    const update = await client.mutate({
      mutation: UPDATE_ARTICLE,
      variables: {
        blogId,
        title: 'Updated article title',
        show: true,
        version: 2,
        articleContent: articleContentUpdate,
        articleId,
      },
      context: {
        headers: {
          authorization: token,
        },
      },
    })
    articleSlug = update.data?.updateArticle.slug
    const res = await client.query({
      query: GET_ONE_ARTICLE,
      variables: {
        slug: articleSlug,
        blogSlug,
      },
    })
    const updatedArticleContent =
      res.data?.getOneArticle.articleContent[0].content

    expect(res.data?.getOneArticle.id).toMatch(uuidRegex)
    expect(res.data?.getOneArticle.postedAt).toMatch(timeStampStringRegex)
    expect(res.data?.getOneArticle.title).toBe('Updated article title')
    expect(res.data?.getOneArticle.articleContent).toBeDefined()
    expect(updatedArticleContent).toMatchObject(articleContentUpdate)
  })

  it('Gets one article by slug and blogSlug should return only current content', async () => {
    const res = await client.query({
      query: GET_ONE_ARTICLE,
      variables: {
        slug: articleSlug,
        blogSlug,
      },
    })

    expect(res.data?.getOneArticle.id).toMatch(uuidRegex)
    expect(res.data?.getOneArticle.postedAt).toMatch(timeStampStringRegex)
    expect(res.data?.getOneArticle.articleContent).toBeDefined()
    expect(res.data?.getOneArticle.articleContent).toHaveLength(1)
    expect(res.data?.getOneArticle.articleContent[0].current).toBe(true)
  })

  it('Gets one article with allVersions: true and should return multiple versions of content', async () => {
    const res = await client.query({
      query: GET_ONE_ARTICLE,
      variables: {
        allVersions: true,
        slug: articleSlug,
        blogSlug,
      },
      context: {
        headers: {
          authorization: token,
        },
      },
    })
    expect(res.data?.getOneArticle.id).toMatch(uuidRegex)
    expect(res.data?.getOneArticle.postedAt).toMatch(timeStampStringRegex)
    expect(res.data?.getOneArticle.articleContent).toBeDefined()
    expect(res.data?.getOneArticle.articleContent).toHaveLength(2)
  })
})
