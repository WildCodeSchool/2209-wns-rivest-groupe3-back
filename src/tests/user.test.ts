import client from './clientUtil'
import clearAllEntities from './setupDb'
import {
  CREATE_USER,
  GET_TOKEN,
  GET_ALL_USERS,
  UPDATE_USER,
  UPDATE_USER_PASSWORD,
} from './gql'

const testUserData = {
  email: 'test-user@test.com',
  password: 'test',
  nickname: 'test',
  lastName: 'Test',
  firstName: 'Mister',
  avatar:
    'https://img.freepik.com/vecteurs-libre/homme-mafieux-mysterieux-fumant-cigarette_52683-34828.jpg?w=1380&t=st=1674848201~exp=1674848801~hmac=11eca556d742ceedc183dd83a44cde1585018136be0e7662e89a65ad86ebb9b1',
  description: 'Test description',
  city: 'Testville',
}

const testUserData2 = {
  email: 'test-user2@test.com',
  password: 'tester',
  nickname: 'test2',
  lastName: 'Testo',
  firstName: 'Madam',
  avatar:
    'https://img.freepik.com/vecteurs-libre/homme-mafieux-mysterieux-fumant-cigarette_52683-34828.jpg?w=1380&t=st=1674848201~exp=1674848801~hmac=11eca556d742ceedc183dd83a44cde1585018136be0e7662e89a65ad86ebb9b1',
  description: 'Test2 description2',
  city: 'Testopolis',
}

const partialUpdateTestUserData = {
  avatar: 'New image url',
  city: 'Updateville',
  password: 'newP@sswœrd',
}

const uuidRegex =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/

const jwtRegex = /[a-zA-Z0-9-_=]+\.[a-zA-Z0-9-_=]+\.?[a-zA-Z0-9-_.+/=]*/

describe('User resolver', () => {
  beforeAll(async () => {
    await clearAllEntities()
  })
  it('creates a user', async () => {
    const res = await client.mutate({
      mutation: CREATE_USER,
      variables: {
        email: testUserData.email,
        password: testUserData.password,
        nickname: testUserData.nickname,
      },
    })
    expect(res.data).toMatchObject({
      createUser: {
        email: testUserData.email,
        nickname: testUserData.nickname,
      },
    })
    expect(res.data?.createUser.id).toMatch(uuidRegex)
  })

  it('throws an error if email is already taken', async () => {
    const res = await client.mutate({
      mutation: CREATE_USER,
      variables: {
        email: testUserData.email,
        password: testUserData.password,
        nickname: testUserData.nickname,
      },
    })
    const errorMessage = res.errors?.[0]?.message
    expect(res.errors).toHaveLength(1)
    expect(errorMessage).toBe(
      'An account already exists with this email address'
    )
  })

  it('throws an error if nickname is already taken', async () => {
    const res = await client.mutate({
      mutation: CREATE_USER,
      variables: {
        email: 'test2@test.com',
        password: testUserData.password,
        nickname: testUserData.nickname,
      },
    })
    const errorMessage = res.errors?.[0]?.message
    expect(res.errors).toHaveLength(1)
    expect(errorMessage).toBe('This nickname is already taken')
  })

  it('gets a token', async () => {
    const res = await client.mutate({
      mutation: GET_TOKEN,
      variables: {
        email: testUserData.email,
        password: testUserData.password,
      },
    })
    expect(res.data?.getToken.token).toMatch(jwtRegex)
  })

  it('fails to get a token with wrong password', async () => {
    const res = await client.mutate({
      mutation: GET_TOKEN,
      variables: {
        email: testUserData.email,
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
        password: testUserData.password,
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
        email: testUserData.email,
        password: testUserData.password,
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

  it("updates a user's information", async () => {
    const {
      email,
      password,
      nickname,
      lastName,
      firstName,
      avatar,
      description,
      city,
    } = testUserData
    const tokenRes = await client.mutate({
      mutation: GET_TOKEN,
      variables: {
        email,
        password,
      },
    })

    const { token } = tokenRes.data?.getToken
    const res = await client.mutate({
      mutation: UPDATE_USER,
      context: {
        headers: {
          authorization: token,
        },
      },
      variables: {
        email,
        nickname,
        lastName,
        firstName,
        avatar,
        description,
        city,
      },
    })

    expect(res.data?.updateUser.id).toMatch(uuidRegex)
    expect(res.data?.updateUser).toMatchObject({
      email,
      nickname,
      lastName,
      firstName,
      avatar,
      description,
      city,
    })
  })

  it("partially updates a user's information and gets a token with new password", async () => {
    const { avatar, city } = partialUpdateTestUserData
    const tokenRes = await client.mutate({
      mutation: GET_TOKEN,
      variables: {
        email: testUserData.email,
        password: testUserData.password,
      },
    })
    const { token } = tokenRes.data?.getToken
    const res = await client.mutate({
      mutation: UPDATE_USER,
      context: {
        headers: {
          authorization: token,
        },
      },
      variables: {
        avatar,
        city,
      },
    })
    expect(res.data?.updateUser.id).toMatch(uuidRegex)
    expect(res.data?.updateUser).toMatchObject({
      email: testUserData.email,
      nickname: testUserData.nickname,
      lastName: testUserData.lastName,
      firstName: testUserData.firstName,
      avatar,
      description: testUserData.description,
      city,
    })
  })

  it('updates users password, then fetches token with new password', async () => {
    const tokenRes = await client.mutate({
      mutation: GET_TOKEN,
      variables: {
        email: testUserData.email,
        password: testUserData.password,
      },
    })
    const { token } = tokenRes.data?.getToken

    const res = await client.mutate({
      mutation: UPDATE_USER_PASSWORD,
      context: {
        headers: {
          authorization: token,
        },
      },
      variables: {
        oldPassword: testUserData.password,
        newPassword: partialUpdateTestUserData.password,
      },
    })
    expect(res.data?.updateUserPassword.id).toMatch(uuidRegex)
    expect(res.data?.updateUserPassword).toMatchObject({
      email: testUserData.email,
      nickname: testUserData.nickname,
      lastName: testUserData.lastName,
      firstName: testUserData.firstName,
      avatar: partialUpdateTestUserData.avatar,
      description: testUserData.description,
      city: partialUpdateTestUserData.city,
    })

    const newTokenRes = await client.mutate({
      mutation: GET_TOKEN,
      variables: {
        email: testUserData.email,
        password: partialUpdateTestUserData.password,
      },
    })

    expect(newTokenRes.data?.getToken.token).toMatch(jwtRegex)
  })

  it('creates a 2nd user and then fails if first user updates nickname with 2nd user nickame', async () => {
    const res = await client.mutate({
      mutation: CREATE_USER,
      variables: {
        email: testUserData2.email,
        password: testUserData2.password,
        nickname: testUserData2.nickname,
      },
    })
    expect(res.data).toMatchObject({
      createUser: {
        email: testUserData2.email,
        nickname: testUserData2.nickname,
      },
    })
    const tokenRes = await client.mutate({
      mutation: GET_TOKEN,
      variables: {
        email: testUserData.email,
        password: partialUpdateTestUserData.password,
      },
    })
    const { token } = tokenRes.data?.getToken

    const failedUpdateRes = await client.mutate({
      mutation: UPDATE_USER,
      context: {
        headers: {
          authorization: token,
        },
      },
      variables: {
        nickname: testUserData2.nickname,
      },
    })

    const errorMessage = failedUpdateRes.errors?.[0]?.message
    expect(failedUpdateRes.errors).toHaveLength(1)
    expect(errorMessage).toBe('Ce pseudo est déjà pris')
  })
})
