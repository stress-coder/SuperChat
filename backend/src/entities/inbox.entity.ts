import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { InboxType } from '../common/enums/inbox-type.enum';
import { User } from './user.entity';

@Entity()
export class Inbox {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  name!: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: InboxType.PRIVATE,
  })
  type!: InboxType;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ nullable: true })
  createdBy!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'createdBy' })
  createdByUser!: User;

  @Column({ nullable: true, type: 'timestamp' })
  updatedAt!: Date;

  @Column({ nullable: true })
  updatedBy!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'updatedBy' })
  updatedByUser!: User;
}
