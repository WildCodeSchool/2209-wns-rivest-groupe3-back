import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm'
import { Field, ObjectType } from 'type-graphql'
import { Blog } from './Blog'
import { Comment } from './Comment'

@ObjectType()
@Entity()
export class User {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Field()
  @Column({ type: 'varchar', nullable: false, unique: true })
  email: string

  @Field()
  @Column({ type: 'varchar', nullable: false, unique: true })
  nickname: string

  @Field()
  @Column({ type: 'varchar', nullable: false })
  password: string

  @Field({ nullable: true })
  @Column({ type: 'varchar', nullable: true })
  city: string

  @Field({ nullable: true })
  @Column({ type: 'varchar', nullable: true })
  firstName: string

  @Field({ nullable: true })
  @Column({ type: 'varchar', nullable: true })
  lastName: string

  @Field({ nullable: true })
  @Column({ type: 'varchar', nullable: true })
  description: string

  @Field({ nullable: true })
  @Column({ type: 'varchar', nullable: true })
  avatar: string

  @Field()
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date

  @Field({ nullable: true })
  @Column({ type: 'timestamp with time zone', nullable: true })
  lastLogin: Date

  @Field(() => [Blog])
  @OneToMany(() => Blog, (blog) => blog.user)
  blogs: Blog[]

  @Field(() => [Comment])
  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[]
}
