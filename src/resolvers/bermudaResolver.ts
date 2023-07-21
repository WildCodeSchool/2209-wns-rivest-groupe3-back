import {
  Arg,
  Args,
  ArgsType,
  Authorized,
  Ctx,
  Field,
  Mutation,
  Query,
  Resolver,
} from 'type-graphql'
import dataSource from '../utils'
import { Bermuda } from '../entities/Bermuda'
import { User } from '../entities/User'

@ArgsType()
class DeleteBermudaArgs {
  @Field()
  bermudaId: string
}

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

  @Authorized()
  @Mutation(() => String)
  async deleteBermuda(
    @Ctx() context: { userFromToken: { userId: string; email: string } },
    @Args() { bermudaId }: DeleteBermudaArgs
  ): Promise<string> {
    try {
      const {
        userFromToken: { userId },
      } = context
      const bermuda = await dataSource.manager.findOneOrFail(Bermuda, {
        where: { id: bermudaId },
        relations: {
          user: true,
        },
      })
      if (bermuda.user.id !== userId) {
        throw new Error('You are not authorized to delete this bermuda.')
      }
      await dataSource.manager.delete(Bermuda, bermudaId)
      return 'Bermuda deleted successfully'
    } catch (error: any) {
      console.error(error)
      throw new Error(error)
    }
  }
}
