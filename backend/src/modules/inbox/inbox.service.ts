import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, In, type EntityManager } from 'typeorm';
import { Inbox } from '../../entities/inbox.entity';
import { InboxUser } from '../../entities/inbox-user.entity';
import { User } from '../../entities/user.entity';
import { InboxType } from '../../common/enums/inbox-type.enum';
import { InboxUserStatus } from '../../common/enums/inbox-user-status.enum';
import { CreateGroupInboxDto } from './dto/create-group-inbox.dto';
import { UpdateInboxSettingsDto } from './dto/update-inbox-settings.dto';

export interface InboxMember {
  userId: string;
  nickname: string;
  user: Pick<User, 'id' | 'name' | 'username' | 'avatar' | 'isOnline' | 'lastSeen'>;
}

@Injectable()
export class InboxService {
  constructor(private readonly dataSource: DataSource) {}

  async createGroup(user: Pick<User, 'id'>, dto: CreateGroupInboxDto) {
    const memberIds = [...new Set(dto.memberIds)].filter((id) => id !== user.id);

    if (memberIds.length === 0) {
      throw new BadRequestException('A group needs at least one other member.');
    }

    return this.dataSource.transaction(async (manager) => {
      const users = await manager.getRepository(User).findBy({ id: In(memberIds) });

      if (users.length !== memberIds.length) {
        throw new NotFoundException('One or more members not found.');
      }

      const inbox = await this.createInbox(
        manager,
        InboxType.GROUP,
        user.id,
        [user.id, ...memberIds],
        dto.name,
      );

      return {
        message: 'Group created successfully.',
        data: inbox,
      };
    });
  }

  async findAllForUser(user: Pick<User, 'id'>) {
    const manager = this.dataSource.manager;

    const memberships = await manager.getRepository(InboxUser).find({
      where: { userId: user.id },
      relations: { inbox: true },
      order: { inbox: { createdAt: 'DESC' } },
    });

    const members = await this.loadMembers(
      manager,
      memberships.map((membership) => membership.inboxId),
    );

    return {
      message: 'Inboxes retrieved successfully.',
      data: memberships.map((membership) =>
        this.toInboxView(membership, members.get(membership.inboxId) ?? []),
      ),
    };
  }

  async findOne(user: Pick<User, 'id'>, inboxId: string) {
    const manager = this.dataSource.manager;

    const membership = await manager.getRepository(InboxUser).findOne({
      where: { inboxId, userId: user.id },
      relations: { inbox: true },
    });

    if (!membership) {
      throw new ForbiddenException('Access denied.');
    }

    const members = await this.loadMembers(manager, [inboxId]);

    return {
      message: 'Inbox retrieved successfully.',
      data: this.toInboxView(membership, members.get(inboxId) ?? []),
    };
  }

  async updateSettings(user: Pick<User, 'id'>, inboxId: string, dto: UpdateInboxSettingsDto) {
    const membership = await this.assertMember(inboxId, user.id);

    if (dto.nickname !== undefined) {
      membership.nickname = dto.nickname;
    }

    if (dto.status !== undefined) {
      membership.status = dto.status;
    }

    if (dto.properties !== undefined) {
      membership.properties = { ...membership.properties, ...dto.properties };
    }

    const saved = await this.dataSource.manager.getRepository(InboxUser).save(membership);

    return {
      message: 'Inbox settings updated successfully.',
      data: this.toSettings(saved),
    };
  }

  /**
   * Returns the private inbox between two users, creating the inbox and both
   * inbox users when they chat for the first time.
   */
  async openPrivateInbox(manager: EntityManager, userId: string, recipientId: string) {
    if (userId === recipientId) {
      throw new BadRequestException('Cannot start a chat with yourself.');
    }

    const recipient = await manager.getRepository(User).findOneBy({ id: recipientId });

    if (!recipient) {
      throw new NotFoundException('Recipient not found.');
    }

    const existingInbox = await manager
      .getRepository(Inbox)
      .createQueryBuilder('inbox')
      .innerJoin(InboxUser, 'a', 'a.inboxId = inbox.id AND a.userId = :userId', { userId })
      .innerJoin(InboxUser, 'b', 'b.inboxId = inbox.id AND b.userId = :recipientId', {
        recipientId,
      })
      .where('inbox.type = :type', { type: InboxType.PRIVATE })
      .getOne();

    if (existingInbox) {
      return { inbox: existingInbox, isNew: false };
    }

    const inbox = await this.createInbox(manager, InboxType.PRIVATE, userId, [userId, recipientId]);

    return { inbox, isNew: true };
  }

  /** Membership is the existence of an inbox user row; its status is a personal setting. */
  async assertMember(
    inboxId: string,
    userId: string,
    manager: EntityManager = this.dataSource.manager,
  ) {
    const membership = await manager.getRepository(InboxUser).findOneBy({ inboxId, userId });

    if (!membership) {
      throw new ForbiddenException('Access denied.');
    }

    return membership;
  }

  private async createInbox(
    manager: EntityManager,
    type: InboxType,
    creatorId: string,
    memberIds: string[],
    name?: string,
  ) {
    const inboxRepository = manager.getRepository(Inbox);
    const inbox = await inboxRepository.save(
      inboxRepository.create({ type, name, createdBy: creatorId }),
    );

    const inboxUserRepository = manager.getRepository(InboxUser);
    const joinedAt = new Date();
    await inboxUserRepository.save(
      memberIds.map((userId) =>
        inboxUserRepository.create({
          inboxId: inbox.id,
          userId,
          joinedAt,
          status: InboxUserStatus.ACTIVE,
        }),
      ),
    );

    return inbox;
  }

  private async loadMembers(manager: EntityManager, inboxIds: string[]) {
    const members = new Map<string, InboxMember[]>();

    if (inboxIds.length === 0) {
      return members;
    }

    const rows = await manager.getRepository(InboxUser).find({
      where: { inboxId: In(inboxIds) },
      relations: { user: true },
      select: {
        id: true,
        inboxId: true,
        userId: true,
        nickname: true,
        user: {
          id: true,
          name: true,
          username: true,
          avatar: true,
          isOnline: true,
          lastSeen: true,
        },
      },
    });

    for (const row of rows) {
      const list = members.get(row.inboxId) ?? [];
      list.push({ userId: row.userId, nickname: row.nickname, user: row.user });
      members.set(row.inboxId, list);
    }

    return members;
  }

  private toInboxView(membership: InboxUser, members: InboxMember[]) {
    const { inbox } = membership;

    return {
      id: inbox.id,
      name: inbox.name,
      type: inbox.type,
      createdBy: inbox.createdBy,
      createdAt: inbox.createdAt,
      members,
      settings: this.toSettings(membership),
    };
  }

  private toSettings(membership: InboxUser) {
    return {
      nickname: membership.nickname,
      status: membership.status,
      properties: membership.properties,
      joinedAt: membership.joinedAt,
    };
  }
}
