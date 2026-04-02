import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { UserLevel } from '@prisma/client';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser, DataEntryPermission } from '@apha-bst/shared';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get(':id/permissions')
  async getPermissions(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DataEntryPermission[]> {
    const isSelf = user.userId === id;
    const isSupervisor = user.userLevel === UserLevel.Supervisor;

    if (!isSelf && !isSupervisor) {
      throw new ForbiddenException('You can only view your own permissions');
    }

    return this.permissionsService.getPermissionsForUser(id);
  }
}
