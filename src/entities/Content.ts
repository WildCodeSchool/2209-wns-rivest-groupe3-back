import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import { Field, ObjectType } from 'type-graphql'
import { Article } from './Article'

@ObjectType()
class ContentBlockDataItemImageFile {
  @Field()
  url: string
}

@ObjectType()
class ContentBlockDataItemImage {
  @Field({ nullable: true })
  caption?: string

  @Field({ nullable: true })
  file?: ContentBlockDataItemImageFile

  @Field({ nullable: true })
  stretched?: boolean

  @Field({ nullable: true })
  withBackground?: boolean

  @Field({ nullable: true })
  withBorder?: boolean
}

@ObjectType()
class ContentBlockDataType extends ContentBlockDataItemImage {
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

  @Field()
  @Column({ type: 'boolean', default: true })
  current: boolean

  @ManyToOne(() => Article, (article) => article.articleContent, {
    onDelete: 'CASCADE',
  })
  article: Article
}
