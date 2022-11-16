import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm'
import { Field, ObjectType } from 'type-graphql'
import { User } from './User'

@ObjectType()
@Entity()
export class Blog {
  @Field()
  @PrimaryGeneratedColumn()
  id: number

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
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date

  @ManyToOne(() => User, (user) => user.blogs, {
    onDelete: 'CASCADE',
  })
  user: User
}
