import { Test, type TestingModule } from '@nestjs/testing';
import { InboxController } from './inbox.controller';
import { InboxService } from './inbox.service';
import { type User } from '../../entities/user.entity';
import { InboxUserStatus } from '../../common/enums/inbox-user-status.enum';

describe('InboxController', () => {
  let controller: InboxController;
  let inboxService: {
    createGroup: jest.Mock;
    findAllForUser: jest.Mock;
    findOne: jest.Mock;
    updateSettings: jest.Mock;
  };

  const user = { id: 'user-1' } as User;
  const ok = { message: 'ok', data: null };

  beforeEach(async () => {
    inboxService = {
      createGroup: jest.fn().mockResolvedValue(ok),
      findAllForUser: jest.fn().mockResolvedValue(ok),
      findOne: jest.fn().mockResolvedValue(ok),
      updateSettings: jest.fn().mockResolvedValue(ok),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InboxController],
      providers: [{ provide: InboxService, useValue: inboxService }],
    }).compile();

    controller = module.get(InboxController);
  });

  it('delegates createGroup', async () => {
    const dto = { name: 'Team', memberIds: ['user-2'] };
    await expect(controller.createGroup(user, dto)).resolves.toBe(ok);
    expect(inboxService.createGroup).toHaveBeenCalledWith(user, dto);
  });

  it('delegates findAll', async () => {
    await expect(controller.findAll(user)).resolves.toBe(ok);
    expect(inboxService.findAllForUser).toHaveBeenCalledWith(user);
  });

  it('delegates findOne', async () => {
    await expect(controller.findOne(user, 'inbox-1')).resolves.toBe(ok);
    expect(inboxService.findOne).toHaveBeenCalledWith(user, 'inbox-1');
  });

  it('delegates updateSettings', async () => {
    const dto = { status: InboxUserStatus.MUTED };
    await expect(controller.updateSettings(user, 'inbox-1', dto)).resolves.toBe(ok);
    expect(inboxService.updateSettings).toHaveBeenCalledWith(user, 'inbox-1', dto);
  });
});
