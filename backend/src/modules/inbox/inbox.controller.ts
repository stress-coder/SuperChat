import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InboxService } from './inbox.service';
import { CreateGroupInboxDto } from './dto/create-group-inbox.dto';
import { UpdateInboxSettingsDto } from './dto/update-inbox-settings.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';

@Controller('inboxes')
@UseGuards(JwtAuthGuard)
export class InboxController {
  constructor(private readonly inboxService: InboxService) {}

  @Post('group')
  createGroup(@CurrentUser() user: User, @Body() dto: CreateGroupInboxDto) {
    return this.inboxService.createGroup(user, dto);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.inboxService.findAllForUser(user);
  }

  @Get(':inboxId')
  findOne(@CurrentUser() user: User, @Param('inboxId', new ParseUUIDPipe()) inboxId: string) {
    return this.inboxService.findOne(user, inboxId);
  }

  @Patch(':inboxId/settings')
  updateSettings(
    @CurrentUser() user: User,
    @Param('inboxId', new ParseUUIDPipe()) inboxId: string,
    @Body() dto: UpdateInboxSettingsDto,
  ) {
    return this.inboxService.updateSettings(user, inboxId, dto);
  }
}
