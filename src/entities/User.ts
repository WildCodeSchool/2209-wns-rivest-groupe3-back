import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm'
import { Field, ObjectType } from 'type-graphql'

@ObjectType()
@Entity()
export class User {
  @Field()
  @PrimaryGeneratedColumn()
  id: number

  @Field()
  @Column({ type: 'varchar', nullable: false, unique: true })
  email: string

  @Field()
  @Column({ type: 'varchar', nullable: false, unique: true })
  nickname: string

  @Field()
  @Column({ type: 'varchar', nullable: false })
  password: string

  @Field()
  @Column({ type: 'varchar', nullable: true })
  city: string

  @Field()
  @Column({ type: 'varchar', nullable: true })
  firstName: string

  @Field()
  @Column({ type: 'varchar', nullable: true })
  lastName: string

  @Field()
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date

  @Field()
  @Column({ type: 'timestamp with time zone', nullable: true })
  lastLogin: Date
}
