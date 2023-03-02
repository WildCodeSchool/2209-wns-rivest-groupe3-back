import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import { Field, ObjectType } from 'type-graphql'

@ObjectType()
@Entity()
export class Tag {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Field()
  @Column({ type: 'varchar' })
  name: string
}
