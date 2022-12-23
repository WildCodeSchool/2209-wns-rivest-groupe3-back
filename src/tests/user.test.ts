import { gql } from '@apollo/client/core'
import client from './clientUtil'
import { prepareUserTable } from './prepareDatabase'

const CREATE_USER = gql`
  mutation createUser($email: String!, $password: String!, $nickname: String!) {
    createUser(email: $email, password: $password, nickname: $nickname) {
      id
      email
      nickname
    }
  }
`
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
const GET_ALL_USERS = gql`
  query getAllUsers {
    getAllUsers {
      id
      email
      nickname
    }
  }
`

const uuidRegex =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/

const jwtRegex = /[a-zA-Z0-9-_=]+\.[a-zA-Z0-9-_=]+\.?[a-zA-Z0-9-_.+/=]*/

describe('User resolver', () => {
  // Setup the database before running the tests
  beforeAll(async () => {
    await prepareUserTable()
  })

  it('creates a user', async () => {
    const res = await client.mutate({
      mutation: CREATE_USER,
      variables: {
        email: 'test-user@test.com',
        password: 'test',
        nickname: 'test',
      },
    })
    expect(res.data).toMatchObject({
      createUser: {
        email: 'test-user@test.com',
        nickname: 'test',
      },
    })
    expect(res.data?.createUser.id).toMatch(uuidRegex)
  })

  it('throws an error if email is already taken', async () => {
    const res = await client.mutate({
      mutation: CREATE_USER,
      variables: {
        email: 'test-user@test.com',
        password: 'test',
        nickname: 'test',
      },
    })
    const errorMessage = res.errors?.[0]?.message
    expect(res.errors).toHaveLength(1)
    expect(errorMessage).toBe('Un compte existe déjà avec cette adresse email')
  })

  it('throws an error if nickname is already taken', async () => {
    const res = await client.mutate({
      mutation: CREATE_USER,
      variables: {
        email: 'test2@test.com',
        password: 'test',
        nickname: 'test',
      },
    })
    const errorMessage = res.errors?.[0]?.message
    expect(res.errors).toHaveLength(1)
    expect(errorMessage).toBe('Ce pseudo est déjà pris')
  })

  it('gets a token', async () => {
    const res = await client.mutate({
      mutation: GET_TOKEN,
      variables: {
        email: 'test-user@test.com',
        password: 'test',
      },
    })
    expect(res.data?.getToken.token).toMatch(jwtRegex)
  })

  it('fails to get a token with wrong password', async () => {
    const res = await client.mutate({
      mutation: GET_TOKEN,
      variables: {
        email: 'test-user@test.com',
        password: 'wrong',
      },
    })
    const errorMessage = res.errors?.[0]?.message
    expect(res.errors).toHaveLength(1)
    expect(errorMessage).toBe('Wrong password')
  })

  it('fails to get a token when user email is not found', async () => {
    const res = await client.mutate({
      mutation: GET_TOKEN,
      variables: {
        email: 'fake-email@test.com',
        password: 'wrong',
      },
    })
    const errorMessage = res.errors?.[0]?.message
    expect(res.errors).toHaveLength(1)
    expect(errorMessage).toBe('No user found')
  })

  it('fails to get users without token', async () => {
    const res = await client.query({
      query: GET_ALL_USERS,
    })
    const errorMessage = res.errors?.[0]?.message
    expect(res.errors).toHaveLength(1)
    expect(errorMessage).toBe(
      'Access denied! You need to be authorized to perform this action!'
    )
  })

  it('gets all users', async () => {
    const tokenRes = await client.mutate({
      mutation: GET_TOKEN,
      variables: {
        email: 'test-user@test.com',
        password: 'test',
      },
    })
    const { token } = tokenRes.data?.getToken
    const res = await client.query({
      query: GET_ALL_USERS,
      context: {
        headers: {
          authorization: token,
        },
      },
    })
    expect(res.data?.getAllUsers.length).toBeGreaterThanOrEqual(1)
  })
})
