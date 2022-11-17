import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm'
import { Field, ObjectType } from 'type-graphql'
import { Blog } from './Blog'
import { Content } from './Content'
import { Comment } from './Comment'
import { Category } from './Category'
import { Tag } from './Tag'

@ObjectType()
@Entity()
export class Article {
  @Field()
  @PrimaryGeneratedColumn()
  id: number

  @Field()
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date

  @Field()
  @Column({ type: 'timestamp with time zone' })
  postedAt: Date

  @Field()
  @Column({ type: 'boolean' })
  show: boolean

  @Field({ nullable: true })
  @Column({ type: 'varchar', nullable: true })
  country: string

  @Field()
  @Column({ type: 'int' })
  version: number

  @ManyToOne(() => Blog, (blog) => blog.articles, {
    onDelete: 'CASCADE',
  })
  blog: Blog

  @Field(() => [Content])
  @OneToMany(() => Content, (content) => content.article)
  content: Content[]

  @Field(() => [Comment], { nullable: true })
  @OneToMany(() => Comment, (comment) => comment.article)
  comments: Comment[]

  @Field(() => [Category], { nullable: true })
  @ManyToMany(() => Category)
  @JoinTable()
  categories: Category[]

  @Field(() => [Tag], { nullable: true })
  @ManyToMany(() => Tag)
  @JoinTable()
  tags: Tag[]
}
