import { Test, type TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DataSource, type EntityManager } from 'typeorm';
import { InboxService } from './inbox.service';
import { Inbox } from '../../entities/inbox.entity';
import { InboxUser } from '../../entities/inbox-user.entity';
import { User } from '../../entities/user.entity';
import { InboxType } from '../../common/enums/inbox-type.enum';
import { InboxUserStatus } from '../../common/enums/inbox-user-status.enum';

const ME = '11111111-1111-4111-8111-111111111111';
const OTHER = '22222222-2222-4222-8222-222222222222';
const THIRD = '55555555-5555-4555-8555-555555555555';
const INBOX_ID = '33333333-3333-4333-8333-333333333333';

interface MockRepo {
  findOneBy: jest.Mock;
  findOne: jest.Mock;
  findBy: jest.Mock;
  find: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  createQueryBuilder: jest.Mock;
}

const createMockRepo = (): MockRepo => ({
  findOneBy: jest.fn(),
  findOne: jest.fn(),
  findBy: jest.fn(),
  find: jest.fn(),
  create: jest.fn((entity: unknown) => entity),
  save: jest.fn((entity: unknown) => Promise.resolve(entity)),
  createQueryBuilder: jest.fn(),
});

const firstCallArg = <T>(mock: jest.Mock): T => (mock.mock.calls as unknown[][])[0][0] as T;

describe('InboxService', () => {
  let service: InboxService;
  let repos: Map<unknown, MockRepo>;
  let manager: EntityManager;
  let queryBuilder: { innerJoin: jest.Mock; where: jest.Mock; getOne: jest.Mock };
  let dataSource: { transaction: jest.Mock; manager: EntityManager };

  const me = { id: ME };
  const repo = (entity: unknown): MockRepo => repos.get(entity) as MockRepo;

  const membership = (overrides: Partial<InboxUser> = {}): InboxUser =>
    ({
      id: 'membership-1',
      inboxId: INBOX_ID,
      userId: ME,
      nickname: null,
      joinedAt: new Date('2026-10-01T00:00:00Z'),
      status: InboxUserStatus.ACTIVE,
      properties: null,
      inbox: {
        id: INBOX_ID,
        name: null,
        type: InboxType.PRIVATE,
        createdBy: ME,
        createdAt: new Date('2026-10-01T00:00:00Z'),
      },
      ...overrides,
    }) as unknown as InboxUser;

  beforeEach(async () => {
    repos = new Map<unknown, MockRepo>([
      [User, createMockRepo()],
      [Inbox, createMockRepo()],
      [InboxUser, createMockRepo()],
    ]);
    queryBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };
    repo(Inbox).createQueryBuilder.mockReturnValue(queryBuilder);
    repo(Inbox).save.mockImplementation((entity: Partial<Inbox>) =>
      Promise.resolve({ ...entity, id: INBOX_ID }),
    );

    manager = {
      getRepository: jest.fn((entity: unknown) => repos.get(entity)),
    } as unknown as EntityManager;
    dataSource = {
      manager,
      transaction: jest.fn((cb: (m: EntityManager) => Promise<unknown>) => cb(manager)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [InboxService, { provide: DataSource, useValue: dataSource }],
    }).compile();

    service = module.get(InboxService);
  });

  describe('openPrivateInbox', () => {
    it('creates inbox and both inbox users on first chat', async () => {
      repo(User).findOneBy.mockResolvedValue({ id: OTHER });
      queryBuilder.getOne.mockResolvedValue(null);

      const result = await service.openPrivateInbox(manager, ME, OTHER);

      expect(result.isNew).toBe(true);
      expect(result.inbox.id).toBe(INBOX_ID);
      expect(repo(Inbox).create).toHaveBeenCalledWith({
        type: InboxType.PRIVATE,
        name: undefined,
        createdBy: ME,
      });
      const saved = firstCallArg<Partial<InboxUser>[]>(repo(InboxUser).save);
      expect(saved.map((member) => member.userId)).toEqual([ME, OTHER]);
      expect(saved.every((member) => member.inboxId === INBOX_ID)).toBe(true);
      expect(saved.every((member) => member.status === InboxUserStatus.ACTIVE)).toBe(true);
    });

    it('reuses the existing private inbox', async () => {
      repo(User).findOneBy.mockResolvedValue({ id: OTHER });
      queryBuilder.getOne.mockResolvedValue({ id: INBOX_ID });

      const result = await service.openPrivateInbox(manager, ME, OTHER);

      expect(result).toEqual({ inbox: { id: INBOX_ID }, isNew: false });
      expect(repo(Inbox).save).not.toHaveBeenCalled();
      expect(queryBuilder.where).toHaveBeenCalledWith('inbox.type = :type', {
        type: InboxType.PRIVATE,
      });
    });

    it('rejects chatting with yourself', async () => {
      await expect(service.openPrivateInbox(manager, ME, ME)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('throws NotFound for an unknown recipient', async () => {
      repo(User).findOneBy.mockResolvedValue(null);

      await expect(service.openPrivateInbox(manager, ME, OTHER)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('createGroup', () => {
    it('creates a group inbox with the creator and deduplicated members', async () => {
      repo(User).findBy.mockResolvedValue([{ id: OTHER }, { id: THIRD }]);

      const result = await service.createGroup(me, {
        name: 'Team',
        memberIds: [OTHER, THIRD, OTHER, ME],
      });

      expect(repo(Inbox).create).toHaveBeenCalledWith({
        type: InboxType.GROUP,
        name: 'Team',
        createdBy: ME,
      });
      const saved = firstCallArg<Partial<InboxUser>[]>(repo(InboxUser).save);
      expect(saved.map((member) => member.userId)).toEqual([ME, OTHER, THIRD]);
      expect(result.data.id).toBe(INBOX_ID);
    });

    it('rejects a group with only the creator', async () => {
      await expect(
        service.createGroup(me, { name: 'Solo', memberIds: [ME] }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('throws NotFound when a member does not exist', async () => {
      repo(User).findBy.mockResolvedValue([{ id: OTHER }]);

      await expect(
        service.createGroup(me, { name: 'Team', memberIds: [OTHER, THIRD] }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(repo(Inbox).save).not.toHaveBeenCalled();
    });
  });

  describe('assertMember', () => {
    it('allows a member regardless of personal status', async () => {
      const muted = membership({ status: InboxUserStatus.MUTED });
      repo(InboxUser).findOneBy.mockResolvedValue(muted);

      await expect(service.assertMember(INBOX_ID, ME)).resolves.toBe(muted);
      expect(repo(InboxUser).findOneBy).toHaveBeenCalledWith({ inboxId: INBOX_ID, userId: ME });
    });

    it('forbids non-members', async () => {
      repo(InboxUser).findOneBy.mockResolvedValue(null);

      await expect(service.assertMember(INBOX_ID, ME)).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('findAllForUser', () => {
    it('returns inboxes with members and personal settings', async () => {
      repo(InboxUser)
        .find.mockResolvedValueOnce([membership({ status: InboxUserStatus.ARCHIVED })])
        .mockResolvedValueOnce([
          { inboxId: INBOX_ID, userId: ME, nickname: null, user: { id: ME } },
          { inboxId: INBOX_ID, userId: OTHER, nickname: 'Bob', user: { id: OTHER } },
        ]);

      const result = await service.findAllForUser(me);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe(INBOX_ID);
      expect(result.data[0].members.map((member) => member.userId)).toEqual([ME, OTHER]);
      expect(result.data[0].settings.status).toBe(InboxUserStatus.ARCHIVED);
    });

    it('skips member lookup when the user has no inboxes', async () => {
      repo(InboxUser).find.mockResolvedValueOnce([]);

      const result = await service.findAllForUser(me);

      expect(result.data).toEqual([]);
      expect(repo(InboxUser).find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('returns the inbox for a member', async () => {
      repo(InboxUser).findOne.mockResolvedValue(membership());
      repo(InboxUser).find.mockResolvedValue([]);

      const result = await service.findOne(me, INBOX_ID);

      expect(result.data.id).toBe(INBOX_ID);
      expect(result.data.members).toEqual([]);
    });

    it('forbids non-members', async () => {
      repo(InboxUser).findOne.mockResolvedValue(null);

      await expect(service.findOne(me, INBOX_ID)).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('updateSettings', () => {
    it('updates nickname, status and merges properties', async () => {
      repo(InboxUser).findOneBy.mockResolvedValue(
        membership({ properties: { theme: 'dark', notification: 'all' } }),
      );

      const result = await service.updateSettings(me, INBOX_ID, {
        nickname: 'Work',
        status: InboxUserStatus.MUTED,
        properties: { notification: 'none' },
      });

      expect(result.data).toMatchObject({
        nickname: 'Work',
        status: InboxUserStatus.MUTED,
        properties: { theme: 'dark', notification: 'none' },
      });
    });

    it('leaves untouched fields alone', async () => {
      repo(InboxUser).findOneBy.mockResolvedValue(membership());

      const result = await service.updateSettings(me, INBOX_ID, {});

      expect(result.data).toMatchObject({ nickname: null, status: InboxUserStatus.ACTIVE });
    });
  });
});
