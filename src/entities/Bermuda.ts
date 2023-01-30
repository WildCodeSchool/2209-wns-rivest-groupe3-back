import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm'
import { Field, ObjectType } from 'type-graphql'
import { User } from './User'

@ObjectType()
@Entity()
export class Bermuda {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Field()
  @Column({ type: 'varchar' })
  imageUrl: string

  @Field()
  @Column({ type: 'varchar' })
  text: string

  @Field()
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.blogs, {
    onDelete: 'CASCADE',
  })
  user: User

  @Field(() => [User])
  @OneToMany(() => User, (user) => user.id)
  likes: User[]
}
