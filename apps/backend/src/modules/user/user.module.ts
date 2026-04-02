import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';

@Module({
  controllers: [PermissionsController],
  providers: [UserService, PermissionsService],
  exports: [UserService, PermissionsService],
})
export class UserModule {}
