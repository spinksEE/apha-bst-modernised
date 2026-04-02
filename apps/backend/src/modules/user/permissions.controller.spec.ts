import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import type { AuthenticatedUser, UserRole } from '@apha-bst/shared';

const mockPermissions = [
  { screenName: 'training-records', userId: 2, canWrite: true },
  { screenName: 'reports', userId: 2, canWrite: false },
];

const supervisorUser: AuthenticatedUser = {
  userId: 1,
  userName: 'admin.supervisor',
  userLevel: 'Supervisor' as UserRole,
  userLocation: 1,
  locationName: 'Preston Laboratory',
  sessionId: 'session-1',
};

const dataEntryUser: AuthenticatedUser = {
  userId: 2,
  userName: 'data.entry',
  userLevel: 'DataEntry' as UserRole,
  userLocation: 1,
  locationName: 'Preston Laboratory',
  sessionId: 'session-2',
};

const readOnlyUser: AuthenticatedUser = {
  userId: 3,
  userName: 'read.only',
  userLevel: 'ReadOnly' as UserRole,
  userLocation: 2,
  locationName: 'Weybridge',
  sessionId: 'session-3',
};

describe('PermissionsController', () => {
  let controller: PermissionsController;
  let permissionsService: { getPermissionsForUser: jest.Mock };

  beforeEach(async () => {
    permissionsService = { getPermissionsForUser: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionsController],
      providers: [
        { provide: PermissionsService, useValue: permissionsService },
      ],
    }).compile();

    controller = module.get<PermissionsController>(PermissionsController);
  });

  describe('GET /users/:id/permissions', () => {
    it('allows a user to view their own permissions', async () => {
      permissionsService.getPermissionsForUser.mockResolvedValue(mockPermissions);

      const result = await controller.getPermissions(2, dataEntryUser);

      expect(result).toEqual(mockPermissions);
      expect(permissionsService.getPermissionsForUser).toHaveBeenCalledWith(2);
    });

    it('allows a Supervisor to view any user permissions', async () => {
      permissionsService.getPermissionsForUser.mockResolvedValue(mockPermissions);

      const result = await controller.getPermissions(2, supervisorUser);

      expect(result).toEqual(mockPermissions);
      expect(permissionsService.getPermissionsForUser).toHaveBeenCalledWith(2);
    });

    it('denies a non-Supervisor viewing another user permissions', async () => {
      await expect(
        controller.getPermissions(1, dataEntryUser),
      ).rejects.toThrow(ForbiddenException);

      expect(permissionsService.getPermissionsForUser).not.toHaveBeenCalled();
    });

    it('denies a ReadOnly user viewing another user permissions', async () => {
      await expect(
        controller.getPermissions(1, readOnlyUser),
      ).rejects.toThrow(ForbiddenException);

      expect(permissionsService.getPermissionsForUser).not.toHaveBeenCalled();
    });
  });
});
