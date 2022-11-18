import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import { Field, ObjectType } from 'type-graphql'

@ObjectType()
@Entity()
export class Category {
  @Field()
  @PrimaryGeneratedColumn()
  id: number

  @Field()
  @Column({ type: 'varchar' })
  name: string
}
