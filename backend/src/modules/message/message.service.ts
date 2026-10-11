import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource, IsNull, LessThan } from 'typeorm';
import { Message } from '../../entities/message.entity';
import { User } from '../../entities/user.entity';
import { ContentType } from '../../common/enums/content-type.enum';
import { InboxService } from '../inbox/inbox.service';
import { SendMessageDto } from './dto/send-message.dto';
import { GetMessagesQueryDto } from './dto/get-messages-query.dto';

const DEFAULT_PAGE_SIZE = 50;

@Injectable()
export class MessageService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly inboxService: InboxService,
  ) {}

  async send(user: Pick<User, 'id'>, dto: SendMessageDto) {
    if (dto.inboxId && dto.recipientId) {
      throw new BadRequestException('Provide either inboxId or recipientId, not both.');
    }

    return this.dataSource.transaction(async (manager) => {
      let inboxId: string;
      let isNewInbox = false;

      if (dto.recipientId) {
        const { inbox, isNew } = await this.inboxService.openPrivateInbox(
          manager,
          user.id,
          dto.recipientId,
        );
        inboxId = inbox.id;
        isNewInbox = isNew;
      } else {
        inboxId = dto.inboxId as string;
        await this.inboxService.assertMember(inboxId, user.id, manager);
      }

      const messageRepository = manager.getRepository(Message);

      if (dto.parentId) {
        const parent = await messageRepository.findOneBy({ id: dto.parentId, inboxId });

        if (!parent) {
          throw new BadRequestException('Parent message does not belong to this inbox.');
        }
      }

      const message = await messageRepository.save(
        messageRepository.create({
          inboxId,
          senderId: user.id,
          content: dto.content,
          contentType: dto.contentType ?? ContentType.TEXT,
          parentId: dto.parentId,
          sentAt: new Date(),
        }),
      );

      return {
        message: 'Message sent successfully.',
        data: { message, inboxId, isNewInbox },
      };
    });
  }

  async findByInbox(user: Pick<User, 'id'>, inboxId: string, query: GetMessagesQueryDto) {
    await this.inboxService.assertMember(inboxId, user.id);

    const messages = await this.dataSource.manager.getRepository(Message).find({
      where: {
        inboxId,
        deletedAt: IsNull(),
        ...(query.before ? { sentAt: LessThan(new Date(query.before)) } : {}),
      },
      order: { sentAt: 'DESC' },
      take: query.limit ?? DEFAULT_PAGE_SIZE,
    });

    return {
      message: 'Messages retrieved successfully.',
      data: messages,
    };
  }
}
