import client from './clientUtil'
import clearAllEntities from './setupDb'
import { CREATE_USER, GET_TOKEN, CREATE_BLOG, GET_ALL_BLOGS } from './gql'

const blogTestUserInfo = {
  email: 'blog-test-user@test.com',
  password: 'test',
  nickname: 'blog-test',
}

const uuidRegex =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/

const timeStampStringRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/

describe('Blog resolver', () => {
  const { email, password, nickname } = blogTestUserInfo
  let token: string
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

    const tokenRes = await client.mutate({
      mutation: GET_TOKEN,
      variables: {
        email,
        password,
      },
    })
    token = tokenRes.data?.getToken.token
  })
  it('Creates a blog', async () => {
    const res = await client.mutate({
      mutation: CREATE_BLOG,
      variables: {
        name: 'My Test Blog',
        description: 'A test description for a blog',
      },
      context: {
        headers: {
          authorization: token,
        },
      },
    })
    expect(res.data).toMatchObject({
      createBlog: {
        name: 'My Test Blog',
        description: 'A test description for a blog',
        template: 1,
      },
    })
    expect(res.data?.createBlog.id).toMatch(uuidRegex)
    expect(res.data?.createBlog.createdAt).toMatch(timeStampStringRegex)
  })

  it('fails to create a blog without a token', async () => {
    const res = await client.mutate({
      mutation: CREATE_BLOG,
      variables: {
        name: 'My Test Blog',
        description: 'A test description for a blog',
      },
    })
    const errorMessage = res.errors?.[0]?.message
    expect(res.errors).toHaveLength(1)
    expect(errorMessage).toBe(
      'Access denied! You need to be authorized to perform this action!'
    )
  })

  it('gets all blogs', async () => {
    const res = await client.query({
      query: GET_ALL_BLOGS,
    })
    expect(res.data.getAllBlogs.length).toBeGreaterThan(0)
    expect(res.data?.getAllBlogs[0].id).toMatch(uuidRegex)
    expect(res.data?.getAllBlogs[0].user.id).toMatch(uuidRegex)
    expect(res.data?.getAllBlogs[0].createdAt).toMatch(timeStampStringRegex)
  })
})
