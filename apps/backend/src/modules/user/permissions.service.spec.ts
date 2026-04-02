import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsService } from './permissions.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('PermissionsService', () => {
  let service: PermissionsService;
  let prisma: {
    dataEntryPermission: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      dataEntryPermission: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
  });

  describe('getPermissionsForUser', () => {
    it('returns permissions mapped to DataEntryPermission shape', async () => {
      prisma.dataEntryPermission.findMany.mockResolvedValue([
        { id: 1, screenName: 'training-records', userId: 2, canWrite: true },
        { id: 2, screenName: 'reports', userId: 2, canWrite: false },
      ]);

      const result = await service.getPermissionsForUser(2);

      expect(result).toEqual([
        { screenName: 'training-records', userId: 2, canWrite: true },
        { screenName: 'reports', userId: 2, canWrite: false },
      ]);
      expect(prisma.dataEntryPermission.findMany).toHaveBeenCalledWith({
        where: { userId: 2 },
      });
    });

    it('returns empty array when user has no permissions', async () => {
      prisma.dataEntryPermission.findMany.mockResolvedValue([]);

      const result = await service.getPermissionsForUser(999);

      expect(result).toEqual([]);
    });
  });

  describe('canUserWriteScreen', () => {
    it('returns true when user has write permission for the screen', async () => {
      prisma.dataEntryPermission.findUnique.mockResolvedValue({
        id: 1,
        screenName: 'training-records',
        userId: 2,
        canWrite: true,
      });

      const result = await service.canUserWriteScreen(2, 'training-records');

      expect(result).toBe(true);
      expect(prisma.dataEntryPermission.findUnique).toHaveBeenCalledWith({
        where: { screenName_userId: { screenName: 'training-records', userId: 2 } },
      });
    });

    it('returns false when user has read-only permission for the screen', async () => {
      prisma.dataEntryPermission.findUnique.mockResolvedValue({
        id: 2,
        screenName: 'reports',
        userId: 2,
        canWrite: false,
      });

      const result = await service.canUserWriteScreen(2, 'reports');

      expect(result).toBe(false);
    });

    it('returns false when no permission record exists for the screen', async () => {
      prisma.dataEntryPermission.findUnique.mockResolvedValue(null);

      const result = await service.canUserWriteScreen(2, 'nonexistent');

      expect(result).toBe(false);
    });
  });
});
