import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import { Field, ObjectType } from 'type-graphql'
import { Article } from './Article'

@ObjectType()
class ContentBlockDataType {
  @Field({ nullable: true })
  text?: string

  @Field({ nullable: true })
  level?: number

  @Field({ nullable: true })
  style?: string

  @Field((type) => [String], { nullable: true })
  items?: string[]
}

@ObjectType()
class ContentBlockType {
  @Field()
  id: string

  @Field()
  type: string

  @Field((type) => ContentBlockDataType)
  data: ContentBlockDataType
}

@ObjectType()
class ContentType {
  @Field()
  time: number

  @Field()
  version: string

  @Field((type) => [ContentBlockType])
  blocks: ContentBlockType[]
}

@ObjectType()
@Entity()
export class Content {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Field()
  @Column({ type: 'json' })
  content: ContentType

  @Field()
  @Column({ type: 'int' })
  version: number

  @ManyToOne(() => Article, (article) => article.articleContent, {
    onDelete: 'CASCADE',
  })
  article: Article
}
