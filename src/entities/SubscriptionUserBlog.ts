import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm'
import { Field, ObjectType } from 'type-graphql'
import { Blog } from './Blog'
import { User } from './User'

@ObjectType()
@Entity()
export class SubscriptionUserBlog {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Field()
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date

  @Field(() => Blog)
  @ManyToOne(() => Blog, (blog) => blog.subscriptions, {
    onDelete: 'CASCADE',
  })
  blog: Blog

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.subscribedBlog, {
    onDelete: 'CASCADE',
  })
  user: User
}
