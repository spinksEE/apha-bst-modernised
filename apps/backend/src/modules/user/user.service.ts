import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

type UserWithLocation = User & { location: { id: number; locationName: string; isAHVLA: boolean } };

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserName(userName: string): Promise<UserWithLocation | null> {
    return this.prisma.user.findUnique({
      where: { userName },
      include: { location: true },
    });
  }

  async findById(id: number): Promise<UserWithLocation | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { location: true },
    });
  }
}
