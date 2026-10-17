import { Test, type TestingModule } from '@nestjs/testing';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { type User } from '../../entities/user.entity';

describe('MessageController', () => {
  let controller: MessageController;
  let messageService: { send: jest.Mock; findByInbox: jest.Mock };

  const user = { id: 'user-1' } as User;

  beforeEach(async () => {
    messageService = { send: jest.fn(), findByInbox: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageController],
      providers: [{ provide: MessageService, useValue: messageService }],
    }).compile();

    controller = module.get(MessageController);
  });

  it('delegates send to the service', async () => {
    const dto = { recipientId: 'user-2', content: 'Hi' };
    messageService.send.mockResolvedValue({ message: 'ok', data: null });

    await expect(controller.send(user, dto)).resolves.toEqual({ message: 'ok', data: null });
    expect(messageService.send).toHaveBeenCalledWith(user, dto);
  });

  it('delegates findByInbox to the service', async () => {
    const query = { limit: 20 };
    messageService.findByInbox.mockResolvedValue({ message: 'ok', data: [] });

    await expect(controller.findByInbox(user, 'inbox-1', query)).resolves.toEqual({
      message: 'ok',
      data: [],
    });
    expect(messageService.findByInbox).toHaveBeenCalledWith(user, 'inbox-1', query);
  });
});
