import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { Message } from '../../entities/message.entity';
import { InboxModule } from '../inbox/inbox.module';

@Module({
  imports: [TypeOrmModule.forFeature([Message]), InboxModule],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}
