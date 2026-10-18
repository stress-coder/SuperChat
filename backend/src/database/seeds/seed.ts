import { Logger } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { In, type EntityManager } from 'typeorm';
import AppDataSource from '../../data-source';
import { SALT_ROUNDS } from '../../common/constants/auth.constants';
import { ContentType } from '../../common/enums/content-type.enum';
import { InboxType } from '../../common/enums/inbox-type.enum';
import { InboxUserStatus } from '../../common/enums/inbox-user-status.enum';
import { Inbox } from '../../entities/inbox.entity';
import { InboxUser } from '../../entities/inbox-user.entity';
import { Message } from '../../entities/message.entity';
import { User } from '../../entities/user.entity';

/**
 * Development-only test data: a handful of users plus a few private and group
 * inboxes with messages, so the chat UI has something to show on first login.
 *
 * Run with `pnpm seed`. Safe to re-run — existing seed users are reused and
 * inboxes are only created when the seed users have none yet.
 */

const logger = new Logger('Seed');

interface SeedUser {
  name: string;
  username: string;
}

interface SeedMessage {
  from: string;
  content: string;
}

interface SeedInbox {
  type: InboxType;
  name?: string;
  members: string[];
  messages: SeedMessage[];
}

const SEED_EMAIL_DOMAIN = 'superchat.test';

const SEED_USERS: SeedUser[] = [
  { name: 'Alice Rahman', username: 'alice' },
  { name: 'Bob Hasan', username: 'bob' },
  { name: 'Carol Islam', username: 'carol' },
  { name: 'Dave Chowdhury', username: 'dave' },
  { name: 'Erin Karim', username: 'erin' },
  { name: 'Frank Uddin', username: 'frank' },
];

const SEED_INBOXES: SeedInbox[] = [
  {
    type: InboxType.PRIVATE,
    members: ['alice', 'bob'],
    messages: [
      { from: 'alice', content: 'Hey Bob, did you get a chance to test the chat API?' },
      { from: 'bob', content: 'Yes! Sending and fetching both work.' },
      { from: 'alice', content: 'Great, let us try it from the UI now.' },
    ],
  },
  {
    type: InboxType.PRIVATE,
    members: ['alice', 'carol'],
    messages: [
      { from: 'carol', content: 'Can we move the sync to 10am?' },
      { from: 'alice', content: 'Works for me.' },
    ],
  },
  {
    type: InboxType.PRIVATE,
    members: ['bob', 'dave'],
    messages: [{ from: 'dave', content: 'Thanks for the review!' }],
  },
  {
    type: InboxType.GROUP,
    name: 'SuperChat Core',
    members: ['alice', 'bob', 'carol', 'dave'],
    messages: [
      { from: 'dave', content: 'Deploy is green on staging.' },
      { from: 'carol', content: 'Nice. I will smoke test the login in the morning.' },
      { from: 'alice', content: 'Chat UI is wired to the API now.' },
    ],
  },
];

/** Spacing between seeded messages so they sort deterministically. */
const MESSAGE_GAP_MS = 60_000;

const emailOf = (username: string): string => `${username}@${SEED_EMAIL_DOMAIN}`;

const seedUsers = async (manager: EntityManager, password: string) => {
  const repository = manager.getRepository(User);
  const emails = SEED_USERS.map((user) => emailOf(user.username));
  const existing = await repository.findBy({ email: In(emails) });
  const existingEmails = new Set(existing.map((user) => user.email));

  const missing = SEED_USERS.filter((user) => !existingEmails.has(emailOf(user.username)));

  if (missing.length > 0) {
    const passwordHash = await hash(password, SALT_ROUNDS);
    await repository.save(
      missing.map((user) =>
        repository.create({
          name: user.name,
          username: user.username,
          email: emailOf(user.username),
          password: passwordHash,
        }),
      ),
    );
  }

  logger.log(`Users: ${missing.length} created, ${existing.length} already present.`);

  const users = await repository.findBy({ email: In(emails) });
  return new Map(users.map((user) => [user.username, user]));
};

const seedInboxes = async (manager: EntityManager, users: Map<string, User>) => {
  const userIds = [...users.values()].map((user) => user.id);
  const existingMemberships = await manager
    .getRepository(InboxUser)
    .countBy({ userId: In(userIds) });

  if (existingMemberships > 0) {
    logger.log('Inboxes: seed users already have inboxes, skipping.');
    return;
  }

  const idOf = (username: string): string => {
    const user = users.get(username);

    if (!user) {
      throw new Error(`Seed user "${username}" is missing.`);
    }

    return user.id;
  };

  const inboxRepository = manager.getRepository(Inbox);
  const inboxUserRepository = manager.getRepository(InboxUser);
  const messageRepository = manager.getRepository(Message);

  // Oldest conversation first, each message a minute after the previous one,
  // ending just before now.
  const totalMessages = SEED_INBOXES.reduce((sum, inbox) => sum + inbox.messages.length, 0);
  let sentAt = Date.now() - totalMessages * MESSAGE_GAP_MS;

  for (const seed of SEED_INBOXES) {
    const creatorId = idOf(seed.members[0]);
    const inbox = await inboxRepository.save(
      inboxRepository.create({ type: seed.type, name: seed.name, createdBy: creatorId }),
    );

    const joinedAt = new Date(sentAt);
    await inboxUserRepository.save(
      seed.members.map((username) =>
        inboxUserRepository.create({
          inboxId: inbox.id,
          userId: idOf(username),
          joinedAt,
          status: InboxUserStatus.ACTIVE,
        }),
      ),
    );

    await messageRepository.save(
      seed.messages.map((message) => {
        sentAt += MESSAGE_GAP_MS;

        return messageRepository.create({
          inboxId: inbox.id,
          senderId: idOf(message.from),
          content: message.content,
          contentType: ContentType.TEXT,
          sentAt: new Date(sentAt),
        });
      }),
    );
  }

  logger.log(`Inboxes: ${SEED_INBOXES.length} created with ${totalMessages} messages.`);
};

const run = async () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed test data when NODE_ENV=production.');
  }

  const password = '12345678@';

  await AppDataSource.initialize();

  try {
    const users = await AppDataSource.transaction(async (manager) => {
      const seeded = await seedUsers(manager, password);
      await seedInboxes(manager, seeded);
      return seeded;
    });

    logger.log('Seed users (log in with SEED_USER_PASSWORD):');
    for (const user of users.values()) {
      logger.log(`  ${user.id}  @${user.username}  ${user.email}`);
    }
  } finally {
    await AppDataSource.destroy();
  }
};

run().catch((error: unknown) => {
  logger.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
