import * as argon2 from 'argon2'
import { UserInputError, AuthenticationError } from 'apollo-server'
import {
  Arg,
  Authorized,
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
      throw new UserInputError('Un compte existe déjà avec cette adresse email')
    }
    const userNicknameExists = await dataSource.manager.findOneBy(User, {
      nickname,
    })
    if (userNicknameExists != null) {
      throw new UserInputError('Ce pseudo est déjà pris')
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
          { email: userFromDB.email },
          process.env.JWT_SECRET_KEY
        )
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
}
