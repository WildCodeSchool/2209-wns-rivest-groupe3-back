import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql'
import dataSource from '../utils'
import { Bermuda } from '../entities/Bermuda'
import { User } from '../entities/User'

@Resolver(Bermuda)
export class BermudaResolver {
  @Authorized()
  @Mutation(() => Bermuda)
  async createBermuda(
    @Ctx() context: { userFromToken: { userId: string; email: string } },
    @Arg('imageUrl') imageUrl: string,
    @Arg('text') text: string
  ): Promise<Bermuda> {
    try {
      const {
        userFromToken: { userId },
      } = context
      const user = await dataSource.manager.findOneByOrFail(User, {
        id: userId,
      })
      const newBermuda = new Bermuda()
      newBermuda.imageUrl = imageUrl
      newBermuda.text = text
      newBermuda.user = user

      const savedBermuda = await dataSource.manager.save(newBermuda)
      return savedBermuda
    } catch (error) {
      console.error(error)
      throw new Error('Something went wrong')
    }
  }

  @Query(() => [Bermuda])
  async getAllBermudas(): Promise<Bermuda[]> {
    try {
      const bermudas = await dataSource.manager.find(Bermuda, {
        relations: {
          user: true,
        },
      })
      return bermudas
    } catch (error) {
      console.error(error)
      throw new Error('Something went wrong')
    }
  }
}
