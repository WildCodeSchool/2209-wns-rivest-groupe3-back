import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm'
import { Field, ObjectType } from 'type-graphql'
import { User } from './User'
import { Article } from './Article'
import { SubscriptionUserBlog } from './SubscriptionUserBlog'

@ObjectType()
@Entity()
export class Blog {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Field()
  @Column({ type: 'varchar', unique: true })
  name: string

  @Field({ nullable: true })
  @Column({ type: 'varchar', nullable: true })
  description: string

  @Field()
  @Column({ type: 'int' })
  template: number

  @Field()
  @Column({ type: 'varchar', unique: true })
  slug: string

  @Field({ nullable: true })
  @Column({ type: 'varchar', nullable: true })
  coverUrl: string

  @Field()
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.blogs, {
    onDelete: 'CASCADE',
  })
  user: User

  @Field(() => [Article])
  @OneToMany(() => Article, (article) => article.blog)
  articles: Article[]

  @Field(() => [SubscriptionUserBlog], { nullable: true })
  @OneToMany(() => SubscriptionUserBlog, (subscription) => subscription.blog)
  subscriptions: SubscriptionUserBlog[]
}
