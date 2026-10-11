import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { SendMessageDto } from './dto/send-message.dto';
import { GetMessagesQueryDto } from './dto/get-messages-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  send(@CurrentUser() user: User, @Body() dto: SendMessageDto) {
    return this.messageService.send(user, dto);
  }

  @Get(':inboxId')
  findByInbox(
    @CurrentUser() user: User,
    @Param('inboxId', new ParseUUIDPipe()) inboxId: string,
    @Query() query: GetMessagesQueryDto,
  ) {
    return this.messageService.findByInbox(user, inboxId, query);
  }
}
