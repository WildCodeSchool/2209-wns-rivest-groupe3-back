import * as argon2 from 'argon2'
import { Arg, Mutation, Query, Resolver } from 'type-graphql'
import { User } from '../entities/User'
import dataSource from '../utils'
import jwt from "jsonwebtoken";

@Resolver(User)
export class UserResolver {
  @Query(() => [User])
  async getAlllUsers(): Promise<User[]> {
    return await dataSource.manager.find(User)
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

  @Query(() => String)
  async getToken(
    @Arg('email') email: string,
    @Arg('password') password: string
  ): Promise<string> {
    try {
      const userFromDB = await dataSource.manager.findOneByOrFail(User, {
        email,
      })
      if (process.env.JWT_SECRET_KEY === undefined) {
        console.log(process.env.JWT_SECRET_KEY)
        throw new Error()
      }

      if (await argon2.verify(userFromDB.password, password)) {
        const token = jwt.sign(
          { email: userFromDB.email },
          process.env.JWT_SECRET_KEY
        )
        return token
      } else {
        throw new Error()
      }
    } catch (err) {
      console.log(err)
      throw new Error('Invalid Auth')
    }
  }
}
