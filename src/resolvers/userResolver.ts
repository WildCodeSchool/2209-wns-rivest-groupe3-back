import * as argon2 from 'argon2'
import { UserInputError, ApolloError, AuthenticationError } from 'apollo-server'
import {
  Arg,
  Authorized,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql'
import { User } from '../entities/User'
import dataSource from '../utils'
import jwt from 'jsonwebtoken'

@ObjectType()
class LoginResponse {
  @Field()
  token: string

  @Field(() => User)
  user: User
}

@Resolver(User)
export class UserResolver {
  @Authorized()
  @Query(() => [User])
  async getAllUsers(): Promise<User[]> {
    return await dataSource.manager.find(User, {
      relations: {
        blogs: true,
      },
    })
  }

  @Query(() => User)
  async getOneUser(
    @Arg('id') id: string,
    @Arg('nickname', { nullable: true }) nickname: string,
    @Arg('city', { nullable: true }) city: string,
    @Arg('description', { nullable: true }) description: string,
    @Arg('avatar', { nullable: true }) avatar: string,
    @Arg('firstName', { nullable: true }) firstName: string,
    @Arg('lastName', { nullable: true }) lastName: string
  ): Promise<User> {
    try {
      const user = await dataSource.manager.findOneBy(User, {
        id,
      })
      if (user != null) {
        return user
      } else {
        throw new ApolloError('Unable to find the user')
      }
    } catch (err) {
      console.error(err)
      throw new ApolloError('Unable to access the user')
    }
  }

  @Mutation(() => User)
  async createUser(
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Arg('nickname') nickname: string,
    @Arg('city', { nullable: true }) city: string,
    @Arg('description', { nullable: true }) description: string,
    @Arg('avatar', { nullable: true }) avatar: string,
    @Arg('firstName', { nullable: true }) firstName: string,
    @Arg('lastName', { nullable: true }) lastName: string
  ): Promise<User> {
    const userEmailExists = await dataSource.manager.findOneBy(User, {
      email,
    })
    if (userEmailExists != null) {
      throw new UserInputError(
        'An account already exists with this email address'
      )
    }
    const userNicknameExists = await dataSource.manager.findOneBy(User, {
      nickname,
    })
    if (userNicknameExists != null) {
      throw new UserInputError('This nickname is already used')
    }

    const newUser = new User()
    newUser.email = email
    newUser.nickname = nickname
    newUser.password = await argon2.hash(password)
    newUser.city = city
    newUser.firstName = firstName
    newUser.lastName = lastName
    newUser.description = description
    newUser.avatar = avatar
    newUser.lastLogin = new Date()

    const userFromDb = await dataSource.manager.save(User, newUser)
    return userFromDb
  }

  @Mutation(() => LoginResponse)
  async getToken(
    @Arg('email') email: string,
    @Arg('password') password: string
  ): Promise<LoginResponse> {
    const userFromDB = await dataSource.manager.findOneBy(User, {
      email,
    })
    if (process.env.JWT_SECRET_KEY === undefined) {
      throw new AuthenticationError('No secret key')
    }
    if (userFromDB === null) {
      throw new AuthenticationError('No user found')
    }
    try {
      if (await argon2.verify(userFromDB.password, password)) {
        const token = jwt.sign(
          { email: userFromDB.email, userId: userFromDB.id },
          process.env.JWT_SECRET_KEY
        )

        userFromDB.lastLogin = new Date()
        await dataSource.manager.save(userFromDB)

        const user = new LoginResponse()
        user.user = userFromDB
        user.token = token
        return user
      } else {
        throw new Error('Wrong password')
      }
    } catch (err: any) {
      throw new AuthenticationError(err.message)
    }
  }

  @Authorized()
  @Mutation(() => User)
  async updateUser(
    @Ctx() context: { userFromToken: { userId: string; email: string } },
    @Arg('id', { nullable: true }) id?: string,
    @Arg('email', { nullable: true }) email?: string,
    @Arg('password', { nullable: true }) password?: string,
    @Arg('nickname', { nullable: true }) nickname?: string,
    @Arg('city', { nullable: true }) city?: string,
    @Arg('description', { nullable: true }) description?: string,
    @Arg('avatar', { nullable: true }) avatar?: string,
    @Arg('firstName', { nullable: true }) firstName?: string,
    @Arg('lastName', { nullable: true }) lastName?: string
  ): Promise<User> {
    const {
      userFromToken: { userId },
    } = context
    const user = await dataSource.manager.findOneByOrFail(User, {
      id: userId,
    })
    if (user === null) {
      throw new Error('user not found')
    }
    if (nickname !== undefined) {
      const userNicknameExists = await dataSource.manager.findOneBy(User, {
        nickname,
        id,
      })
      if (
        userNicknameExists?.nickname != null &&
        userNicknameExists.id !== userId
      ) {
        throw new UserInputError('Ce pseudo est déjà pris')
      }
    }
    const userEmailExists = await dataSource.manager.findOneBy(User, {
      email,
      id,
    })
    if (userEmailExists != null && userEmailExists.id !== userId) {
      throw new UserInputError(
        'Un compte existe déjà avec cette addresse email'
      )
    }

    user.nickname = nickname !== undefined ? nickname : user.nickname
    user.email = email !== undefined ? email : user.email
    user.city = city !== undefined ? city : user.city
    user.firstName = firstName !== undefined ? firstName : user.firstName
    user.lastName = lastName !== undefined ? lastName : user.lastName
    user.description =
      description !== undefined ? description : user.description
    user.avatar = avatar !== undefined ? avatar : user.avatar
    user.password =
      password !== undefined ? await argon2.hash(password) : user.password

    const userFromDb = await dataSource.manager.save(User, user)
    return userFromDb
  }

  @Authorized()
  @Mutation(() => String)
  async deleteUser(
    @Ctx() context: { userFromToken: { userId: string } }
  ): Promise<String> {
    try {
      const {
        userFromToken: { userId },
      } = context
      await dataSource.manager.findOneByOrFail(User, {
        id: userId,
      })
      const deletedMessage = `Compte supprimé avec succès`
      await dataSource.manager.delete(User, userId)
      return deletedMessage
    } catch (err) {
      console.error(err)
      throw new ApolloError('Impossible de supprimer le comtpe')
    }
  }
}
