import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm'
import { Field, ObjectType } from 'type-graphql'
import { Article } from './Article'
import { User } from './User'
import { Blog } from './Blog'

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
  @Column({ type: 'varchar' })
  content: string

  @ManyToOne(() => Article, (article) => article.comments, {
    onDelete: 'CASCADE',
  })
  article: Article

  @ManyToOne(() => User, (user) => user.comments, {
    onDelete: 'CASCADE',
  })
  user: User

  @ManyToOne(() => Blog, (blog) => blog.comments, {
    onDelete: 'CASCADE',
  })
  blog: Blog
}
