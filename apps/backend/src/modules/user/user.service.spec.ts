import { Test, TestingModule } from '@nestjs/testing';
import { UserLevel } from '@prisma/client';
import { UserService } from './user.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockUser = {
  id: 1,
  userName: 'admin.supervisor',
  locationId: 1,
  userLevel: UserLevel.Supervisor,
  location: { id: 1, locationName: 'Preston Laboratory', isAHVLA: false },
};

describe('UserService', () => {
  let service: UserService;
  let prisma: { user: { findUnique: jest.Mock } };

  beforeEach(async () => {
    prisma = { user: { findUnique: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('findByUserName', () => {
    it('returns user with location when found', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByUserName('admin.supervisor');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { userName: 'admin.supervisor' },
        include: { location: true },
      });
    });

    it('returns null when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.findByUserName('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('returns user with location when found', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById(1);

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { location: true },
      });
    });

    it('returns null when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
    });
  });
});
