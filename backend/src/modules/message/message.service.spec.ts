import { Test, type TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { DataSource, type EntityManager } from 'typeorm';
import { MessageService } from './message.service';
import { InboxService } from '../inbox/inbox.service';
import { Message } from '../../entities/message.entity';
import { ContentType } from '../../common/enums/content-type.enum';

const SENDER_ID = '11111111-1111-4111-8111-111111111111';
const RECIPIENT_ID = '22222222-2222-4222-8222-222222222222';
const INBOX_ID = '33333333-3333-4333-8333-333333333333';
const PARENT_ID = '44444444-4444-4444-8444-444444444444';

const firstCallArg = <T>(mock: jest.Mock): T => (mock.mock.calls as unknown[][])[0][0] as T;

describe('MessageService', () => {
  let service: MessageService;
  let messageRepository: {
    findOneBy: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let inboxService: { openPrivateInbox: jest.Mock; assertMember: jest.Mock };
  let manager: EntityManager;
  let dataSource: { transaction: jest.Mock; manager: EntityManager };

  const sender = { id: SENDER_ID };

  beforeEach(async () => {
    messageRepository = {
      findOneBy: jest.fn(),
      find: jest.fn(),
      create: jest.fn((entity: unknown) => entity),
      save: jest.fn((entity: unknown) => Promise.resolve(entity)),
    };
    inboxService = { openPrivateInbox: jest.fn(), assertMember: jest.fn() };
    manager = {
      getRepository: jest.fn((entity: unknown) =>
        entity === Message ? messageRepository : undefined,
      ),
    } as unknown as EntityManager;
    dataSource = {
      manager,
      transaction: jest.fn((cb: (m: EntityManager) => Promise<unknown>) => cb(manager)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        { provide: DataSource, useValue: dataSource },
        { provide: InboxService, useValue: inboxService },
      ],
    }).compile();

    service = module.get(MessageService);
  });

  describe('send', () => {
    it('opens a private inbox for the first message to a recipient', async () => {
      inboxService.openPrivateInbox.mockResolvedValue({ inbox: { id: INBOX_ID }, isNew: true });

      const result = await service.send(sender, { recipientId: RECIPIENT_ID, content: 'Hi' });

      expect(inboxService.openPrivateInbox).toHaveBeenCalledWith(manager, SENDER_ID, RECIPIENT_ID);
      expect(result.data.isNewInbox).toBe(true);
      expect(result.data.inboxId).toBe(INBOX_ID);
      expect(result.data.message).toMatchObject({
        inboxId: INBOX_ID,
        senderId: SENDER_ID,
        content: 'Hi',
        contentType: ContentType.TEXT,
      });
    });

    it('reports an existing private inbox as not new', async () => {
      inboxService.openPrivateInbox.mockResolvedValue({ inbox: { id: INBOX_ID }, isNew: false });

      const result = await service.send(sender, { recipientId: RECIPIENT_ID, content: 'Again' });

      expect(result.data.isNewInbox).toBe(false);
    });

    it('rejects when both inboxId and recipientId are given', async () => {
      await expect(
        service.send(sender, { inboxId: INBOX_ID, recipientId: RECIPIENT_ID, content: 'x' }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('checks membership when sending to an inbox', async () => {
      inboxService.assertMember.mockRejectedValue(new ForbiddenException('Access denied.'));

      await expect(
        service.send(sender, { inboxId: INBOX_ID, content: 'Hi' }),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(inboxService.assertMember).toHaveBeenCalledWith(INBOX_ID, SENDER_ID, manager);
      expect(messageRepository.save).not.toHaveBeenCalled();
    });

    it('rejects a parent message from another inbox', async () => {
      inboxService.assertMember.mockResolvedValue({});
      messageRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.send(sender, { inboxId: INBOX_ID, content: 'Reply', parentId: PARENT_ID }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(messageRepository.findOneBy).toHaveBeenCalledWith({
        id: PARENT_ID,
        inboxId: INBOX_ID,
      });
    });

    it('sends a reply to an inbox the user belongs to', async () => {
      inboxService.assertMember.mockResolvedValue({});
      messageRepository.findOneBy.mockResolvedValue({ id: PARENT_ID });

      const result = await service.send(sender, {
        inboxId: INBOX_ID,
        content: 'Reply',
        parentId: PARENT_ID,
        contentType: ContentType.MARKDOWN,
      });

      expect(result.data.isNewInbox).toBe(false);
      expect(result.data.message).toMatchObject({
        parentId: PARENT_ID,
        contentType: ContentType.MARKDOWN,
      });
    });
  });

  describe('findByInbox', () => {
    it('forbids non-members', async () => {
      inboxService.assertMember.mockRejectedValue(new ForbiddenException('Access denied.'));

      await expect(service.findByInbox(sender, INBOX_ID, {})).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(messageRepository.find).not.toHaveBeenCalled();
    });

    it('returns paginated messages for members', async () => {
      inboxService.assertMember.mockResolvedValue({});
      messageRepository.find.mockResolvedValue([{ id: 'm1' }]);

      const result = await service.findByInbox(sender, INBOX_ID, {
        limit: 10,
        before: '2026-10-01T00:00:00.000Z',
      });

      const options = firstCallArg<{
        take: number;
        order: Record<string, string>;
        where: Record<string, unknown>;
      }>(messageRepository.find);
      expect(options.take).toBe(10);
      expect(options.order).toEqual({ sentAt: 'DESC' });
      expect(options.where).toHaveProperty('sentAt');
      expect(result.data).toEqual([{ id: 'm1' }]);
    });

    it('uses default page size without a cursor', async () => {
      inboxService.assertMember.mockResolvedValue({});
      messageRepository.find.mockResolvedValue([]);

      await service.findByInbox(sender, INBOX_ID, {});

      const options = firstCallArg<{ take: number; where: Record<string, unknown> }>(
        messageRepository.find,
      );
      expect(options.take).toBe(50);
      expect(options.where).not.toHaveProperty('sentAt');
    });
  });
});
