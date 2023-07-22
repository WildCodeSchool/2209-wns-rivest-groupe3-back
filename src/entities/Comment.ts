import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm'
import { Field, ObjectType } from 'type-graphql'
import { Article } from './Article'
import { User } from './User'

@ObjectType()
@Entity()
export class Comment {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Field()
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date

  @Field()
  @UpdateDateColumn({ type: 'timestamp with time zone', nullable: true })
  updatedAt: Date

  @Field()
  @Column({ type: 'varchar' })
  content: string

  @ManyToOne(() => Article, (article) => article.comments, {
    onDelete: 'CASCADE',
  })
  article: Article

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.comments, {
    onDelete: 'CASCADE',
  })
  user: User
}
