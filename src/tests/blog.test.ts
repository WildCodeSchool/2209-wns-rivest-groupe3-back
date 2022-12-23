import { gql } from '@apollo/client/core'
import client from './clientUtil'

const GET_TOKEN = gql`
  mutation getToken($email: String!, $password: String!) {
    getToken(email: $email, password: $password) {
      token
      user {
        id
        email
        nickname
      }
    }
  }
`
const CREATE_BLOG = gql`
  mutation CreateBlog($description: String!, $name: String!, $template: Float) {
    createBlog(description: $description, name: $name, template: $template) {
      id
      name
      description
      template
      createdAt
    }
  }
`
const GET_ALL_BLOGS = gql`
  query GetAllBlogs {
    getAllBlogs {
      id
      name
      description
      template
      createdAt
      user {
        id
        nickname
      }
    }
  }
`

const uuidRegex =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/

const timeStampStringRegex =
  /[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z/

describe('Blog resolver', () => {
  it('gets a token, then creates a blog', async () => {
    const tokenRes = await client.mutate({
      mutation: GET_TOKEN,
      variables: {
        email: 'test-user@test.com',
        password: 'test',
      },
    })
    const { token } = tokenRes.data?.getToken
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
        template: 0,
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
    expect(res.data).toMatchObject({
      getAllBlogs: [
        {
          name: 'My Test Blog',
          description: 'A test description for a blog',
          template: 0,
          user: {
            nickname: 'test',
          },
        },
      ],
    })
    expect(res.data?.getAllBlogs[0].id).toMatch(uuidRegex)
    expect(res.data?.getAllBlogs[0].createdAt).toMatch(timeStampStringRegex)
  })
})
