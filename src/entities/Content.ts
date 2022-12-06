import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import { Field, ObjectType } from 'type-graphql'
import { Article } from './Article'

@ObjectType()
@Entity()
export class Content {
  @Field()
  @PrimaryGeneratedColumn()
  id: number

  // TODO : see if we can type this better
  @Field()
  @Column({ type: 'varchar' })
  content: string

  @Field()
  @Column({ type: 'int' })
  version: number

  @ManyToOne(() => Article, (article) => article.articleContent, {
    onDelete: 'CASCADE',
  })
  article: Article
}
