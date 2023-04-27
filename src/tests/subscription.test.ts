import client from './clientUtil'
import clearAllEntities from './setupDb'
import {
  CREATE_USER,
  GET_TOKEN,
  CREATE_BLOG,
  SUBSCRIBE_TO_A_BLOG,
  UNSUBSCRIBE_TO_A_BLOG,
} from './gql'

const subscribeTestUserInfo1 = {
  email: 'subscribe-test-user@test.com',
  password: 'test',
  nickname: 'subscribe-test',
}
const subscribeTestUserInfo2 = {
  email: 'subscribe-test-user-2@test.com',
  password: 'test',
  nickname: 'subscribe-test-2',
}

let subscribeId: string

const uuidRegex =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/

const timeStampStringRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/

describe('Subscription blog resolver', () => {
  let tokenUser1: string
  let tokenUser2: string
  let blogId1: string

  beforeAll(async () => {
    await clearAllEntities()
    await client.mutate({
      mutation: CREATE_USER,
      variables: { ...subscribeTestUserInfo1 },
    })

    const tokenRes1 = await client.mutate({
      mutation: GET_TOKEN,
      variables: {
        email: subscribeTestUserInfo1.email,
        password: subscribeTestUserInfo1.password,
      },
    })
    tokenUser1 = tokenRes1.data?.getToken.token

    const blogUser1 = await client.mutate({
      mutation: CREATE_BLOG,
      variables: {
        name: 'My Test Blog 1',
        description: 'A test description for a blog 1',
      },
      context: {
        headers: {
          authorization: tokenUser1,
        },
      },
    })
    blogId1 = blogUser1.data?.createBlog.id

    await client.mutate({
      mutation: CREATE_USER,
      variables: { ...subscribeTestUserInfo2 },
    })

    const tokenRes2 = await client.mutate({
      mutation: GET_TOKEN,
      variables: {
        email: subscribeTestUserInfo2.email,
        password: subscribeTestUserInfo2.password,
      },
    })
    tokenUser2 = tokenRes2.data?.getToken.token
  })

  it('User 2 subscribe to blog 1', async () => {
    const res = await client.mutate({
      mutation: SUBSCRIBE_TO_A_BLOG,
      variables: {
        blogId: blogId1,
      },
      context: {
        headers: {
          authorization: tokenUser2,
        },
      },
    })
    subscribeId = res.data?.subscribeToBlog.id
    expect(res.data).toMatchObject({
      subscribeToBlog: {
        user: {
          nickname: 'subscribe-test-2',
        },
        blog: {
          id: blogId1,
          name: 'My Test Blog 1',
        },
      },
    })
    expect(res.data?.subscribeToBlog.id).toMatch(uuidRegex)
    expect(res.data?.subscribeToBlog.createdAt).toMatch(timeStampStringRegex)
  })

  it('User 2 unsubscribe to blog 1', async () => {
    const res = await client.mutate({
      mutation: UNSUBSCRIBE_TO_A_BLOG,
      variables: {
        subscribeId,
        blogId: blogId1,
      },
      context: {
        headers: {
          authorization: tokenUser2,
        },
      },
    })
    expect(res.data?.unsubscribeToBlog).toBe('Blog was unsubscribed successfully !')
  })
})
