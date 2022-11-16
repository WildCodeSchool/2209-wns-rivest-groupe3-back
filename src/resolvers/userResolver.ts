import * as argon2 from 'argon2'
import { Arg, Mutation, Query, Resolver } from 'type-graphql'
import { User } from '../entities/User'
import dataSource from '../utils'

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
    @Arg('nickname') nickname: string
  ): Promise<User> {
    const newUser = new User()
    newUser.email = email
    newUser.nickname = nickname
    newUser.password = await argon2.hash(password)

    const userFromDb = await dataSource.manager.save(User, newUser)
    return userFromDb
  }
}
