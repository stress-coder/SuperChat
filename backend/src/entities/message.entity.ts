import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Inbox } from './inbox.entity';
import { User } from './user.entity';
import { ContentType } from '../common/enums/content-type.enum';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  inboxId!: string;

  @ManyToOne(() => Inbox, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inboxId' })
  inbox!: Inbox;

  @Column({ nullable: true })
  parentId!: string;

  @ManyToOne(() => Message, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parentId' })
  parent!: Message;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'varchar', length: 20, default: ContentType.TEXT })
  contentType!: ContentType;

  @Column()
  senderId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'senderId' })
  sender!: User;

  @Column({ type: 'timestamp', nullable: false })
  sentAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt!: Date;

  @Column({ nullable: true })
  deletedBy!: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'deletedBy' })
  deletedByUser!: User;
}
