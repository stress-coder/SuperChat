import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Inbox } from './inbox.entity';
import { User } from './user.entity';
import { InboxUserStatus } from '../common/enums/inbox-user-status.enum';
import type { InboxUserProperties } from '../common/interfaces/inbox-user-properties.interface';

@Entity()
export class InboxUser {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  inboxId!: string;

  @ManyToOne(() => Inbox, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inboxId' })
  inbox!: Inbox;

  @Column()
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ nullable: true })
  nickname!: string;

  @Column({ nullable: false, type: 'timestamp' })
  joinedAt!: Date;

  @Column({
    type: 'varchar',
    length: 20,
    default: InboxUserStatus.ACTIVE,
  })
  status!: InboxUserStatus;

  @Column({ type: 'json', nullable: true })
  properties!: InboxUserProperties;
}
