import client from './clientUtil'
import clearAllEntities from './setupDb'
import {
  CREATE_USER,
  GET_TOKEN,
  CREATE_BLOG,
  CREATE_ARTICLE,
  GET_ONE_ARTICLE,
  CREATE_COMMENT,
  UPDATE_COMMENT,
  DELETE_COMMENT,
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

const uuidRegex =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/

const timeStampStringRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/

describe('Comment Resolver', () => {
  const { email, password, nickname } = articleTestUserInfo
  let token: string
  let blogId: string
  let blogSlug: string
  let articleSlug: string
  let articleId: string
  let commentId: string

  const { email2, password2, nickname2 } = articleTestUserInfo2

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
        name: 'Comment Blog',
        description: 'A blog for comment resolver testing',
      },
      context: {
        headers: {
          authorization: token,
        },
      },
    })
    blogId = blog.data?.createBlog.id
    blogSlug = blog.data?.createBlog.slug
  })

  it('Creates a new article', async () => {
    const res = await client.mutate({
      mutation: CREATE_ARTICLE,
      variables: {
        blogId,
        title: 'Test comment article',
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
    expect(res.data?.createArticle.title).toBe('Test comment article')
    expect(res.data?.createArticle.createdAt).toMatch(timeStampStringRegex)
    expect(res.data?.createArticle.postedAt).toMatch(timeStampStringRegex)
    expect(res.data?.createArticle.articleContent).toBeDefined()
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

  it('Creates a new comment', async () => {
    const res = await client.mutate({
      mutation: CREATE_COMMENT,
      variables: {
        articleId,
        content: 'first comment',
      },
      context: {
        headers: {
          authorization: token,
        },
      },
    })

    commentId = res.data?.commentArticle.id
    expect(res.data?.commentArticle.user.id).toMatch(uuidRegex)
    expect(commentId).toMatch(uuidRegex)
    expect(res.data?.commentArticle.content).toBeDefined()
    expect(res.data?.commentArticle.content).toBe('first comment')
    expect(res.data?.commentArticle.createdAt).toMatch(timeStampStringRegex)
    expect(res.data?.commentArticle.updatedAt).toMatch(timeStampStringRegex)
  })

  it('Upadte comment', async () => {
    const res = await client.mutate({
      mutation: UPDATE_COMMENT,
      variables: {
        commentId,
        content: 'new version of first comment',
      },
      context: {
        headers: {
          authorization: token,
        },
      },
    })

    expect(res.data?.updateComment.content).toBeDefined()
    expect(res.data?.updateComment.content).toBe('new version of first comment')
    expect(res.data?.updateComment.updatedAt).toMatch(timeStampStringRegex)
  })

  it('Delete comment', async () => {
    const res = await client.mutate({
      mutation: DELETE_COMMENT,
      variables: {
        commentId,
      },
      context: {
        headers: {
          authorization: token,
        },
      },
    })

    expect(res.data?.deleteComment).toBe(undefined)
  })
})
