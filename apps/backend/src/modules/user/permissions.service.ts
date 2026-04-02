import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { DataEntryPermission } from '@apha-bst/shared';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPermissionsForUser(userId: number): Promise<DataEntryPermission[]> {
    const permissions = await this.prisma.dataEntryPermission.findMany({
      where: { userId },
    });

    return permissions.map((p) => ({
      screenName: p.screenName,
      userId: p.userId,
      canWrite: p.canWrite,
    }));
  }

  async canUserWriteScreen(userId: number, screenName: string): Promise<boolean> {
    const permission = await this.prisma.dataEntryPermission.findUnique({
      where: { screenName_userId: { screenName, userId } },
    });

    return permission?.canWrite ?? false;
  }
}
