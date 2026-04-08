import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { SiteService } from './site.service';
import { PrismaService } from '../../prisma/prisma.service';

const makeSite = (overrides: Partial<Record<string, unknown>> = {}) => ({
  plant_no: 'UK12345',
  name: 'Test Abattoir Ltd',
  address_line_1: null,
  address_line_2: null,
  address_town: null,
  address_county: null,
  address_post_code: null,
  telephone: null,
  fax: null,
  is_apha_site: false,
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

function uniqueError(target: string[]): Prisma.PrismaClientKnownRequestError {
  const error = new Prisma.PrismaClientKnownRequestError(
    'Unique constraint failed',
    { code: 'P2002', clientVersion: '5.0.0', meta: { target } },
  );
  return error;
}

describe('SiteService', () => {
  let service: SiteService;
  let prisma: {
    site: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      site: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SiteService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<SiteService>(SiteService);
  });

  describe('createSite', () => {
    it('creates a site successfully', async () => {
      const site = makeSite();
      prisma.site.create.mockResolvedValue(site);

      const result = await service.createSite({
        plant_no: 'UK12345',
        name: 'Test Abattoir Ltd',
      });

      expect(result).toEqual(site);
      expect(prisma.site.create).toHaveBeenCalledWith({
        data: { plant_no: 'UK12345', name: 'Test Abattoir Ltd' },
      });
    });

    it('throws ConflictException for duplicate plant_no (BR-006)', async () => {
      prisma.site.create.mockRejectedValue(uniqueError(['plant_no']));

      await expect(
        service.createSite({ plant_no: 'UK12345', name: 'New Site' }),
      ).rejects.toThrow(
        new ConflictException('A site with this Plant Number already exists.'),
      );
    });

    it('throws ConflictException for duplicate name (BR-015)', async () => {
      prisma.site.create.mockRejectedValue(uniqueError(['name']));

      await expect(
        service.createSite({ plant_no: 'UK99999', name: 'Test Abattoir Ltd' }),
      ).rejects.toThrow(
        new ConflictException('A site with this Name already exists.'),
      );
    });

    it('rethrows non-Prisma errors', async () => {
      prisma.site.create.mockRejectedValue(new Error('DB down'));

      await expect(
        service.createSite({ plant_no: 'UK12345', name: 'Test' }),
      ).rejects.toThrow('DB down');
    });
  });

  describe('findAll', () => {
    it('returns all sites ordered by name with only plant_no and name', async () => {
      const sites = [
        { plant_no: 'A1', name: 'Alpha' },
        { plant_no: 'B2', name: 'Beta' },
      ];
      prisma.site.findMany.mockResolvedValue(sites);

      const result = await service.findAll();

      expect(result).toEqual(sites);
      expect(prisma.site.findMany).toHaveBeenCalledWith({
        select: { plant_no: true, name: true },
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('findByPlantNo', () => {
    it('returns a site when found', async () => {
      const site = makeSite();
      prisma.site.findUnique.mockResolvedValue(site);

      const result = await service.findByPlantNo('UK12345');

      expect(result).toEqual(site);
    });

    it('throws NotFoundException when not found', async () => {
      prisma.site.findUnique.mockResolvedValue(null);

      await expect(service.findByPlantNo('MISSING')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('searchSites', () => {
    it('searches by plant_no (exact match)', async () => {
      prisma.site.findMany.mockResolvedValue([]);

      await service.searchSites({ plant_no: 'UK12345' });

      expect(prisma.site.findMany).toHaveBeenCalledWith({
        where: { plant_no: 'UK12345' },
        select: { plant_no: true, name: true },
        orderBy: { name: 'asc' },
        take: 50,
      });
    });

    it('searches by name (contains, case-insensitive)', async () => {
      prisma.site.findMany.mockResolvedValue([]);

      await service.searchSites({ name: 'abattoir' });

      expect(prisma.site.findMany).toHaveBeenCalledWith({
        where: { name: { contains: 'abattoir', mode: 'insensitive' } },
        select: { plant_no: true, name: true },
        orderBy: { name: 'asc' },
        take: 50,
      });
    });

    it('applies AND logic when both params provided', async () => {
      prisma.site.findMany.mockResolvedValue([]);

      await service.searchSites({ plant_no: 'UK12345', name: 'test' });

      expect(prisma.site.findMany).toHaveBeenCalledWith({
        where: {
          plant_no: 'UK12345',
          name: { contains: 'test', mode: 'insensitive' },
        },
        select: { plant_no: true, name: true },
        orderBy: { name: 'asc' },
        take: 50,
      });
    });

    it('returns all sites (up to 50) when no params given', async () => {
      prisma.site.findMany.mockResolvedValue([]);

      await service.searchSites({});

      expect(prisma.site.findMany).toHaveBeenCalledWith({
        where: {},
        select: { plant_no: true, name: true },
        orderBy: { name: 'asc' },
        take: 50,
      });
    });
  });

  describe('updateSite', () => {
    it('updates address/contact fields', async () => {
      const site = makeSite({ address_town: 'Oxton' });
      prisma.site.findUnique.mockResolvedValue(makeSite());
      prisma.site.update.mockResolvedValue(site);

      const result = await service.updateSite('UK12345', {
        address_town: 'Oxton',
      });

      expect(result.address_town).toBe('Oxton');
      expect(prisma.site.update).toHaveBeenCalledWith({
        where: { plant_no: 'UK12345' },
        data: { address_town: 'Oxton' },
      });
    });

    it('throws NotFoundException for non-existent site', async () => {
      prisma.site.findUnique.mockResolvedValue(null);

      await expect(
        service.updateSite('MISSING', { address_town: 'Oxton' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateSiteName', () => {
    it('evolves a simple name (BR-007)', async () => {
      prisma.site.findUnique.mockResolvedValue(
        makeSite({ name: 'Old Abattoir Co' }),
      );
      prisma.site.update.mockResolvedValue(
        makeSite({ name: 'New Meadow Farms [Old Abattoir Co]' }),
      );

      const result = await service.updateSiteName('UK12345', {
        new_name: 'New Meadow Farms',
      });

      expect(result.name).toBe('New Meadow Farms [Old Abattoir Co]');
      expect(prisma.site.update).toHaveBeenCalledWith({
        where: { plant_no: 'UK12345' },
        data: { name: 'New Meadow Farms [Old Abattoir Co]' },
      });
    });

    it('evolves an already-evolved name, stripping old bracket suffix', async () => {
      prisma.site.findUnique.mockResolvedValue(
        makeSite({ name: 'Current Name [Old Name]' }),
      );
      prisma.site.update.mockResolvedValue(
        makeSite({ name: 'Future Name [Current Name]' }),
      );

      const result = await service.updateSiteName('UK12345', {
        new_name: 'Future Name',
      });

      expect(result.name).toBe('Future Name [Current Name]');
      expect(prisma.site.update).toHaveBeenCalledWith({
        where: { plant_no: 'UK12345' },
        data: { name: 'Future Name [Current Name]' },
      });
    });

    it('throws ConflictException when evolved name exceeds 50 chars', async () => {
      prisma.site.findUnique.mockResolvedValue(
        makeSite({ name: 'A Very Long Existing Site Name Here' }),
      );

      await expect(
        service.updateSiteName('UK12345', {
          new_name: 'Another Extremely Long New Name',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('throws ConflictException for duplicate evolved name', async () => {
      prisma.site.findUnique.mockResolvedValue(makeSite({ name: 'Old' }));
      prisma.site.update.mockRejectedValue(uniqueError(['name']));

      await expect(
        service.updateSiteName('UK12345', { new_name: 'New' }),
      ).rejects.toThrow(
        new ConflictException('A site with this Name already exists.'),
      );
    });

    it('throws NotFoundException for non-existent site', async () => {
      prisma.site.findUnique.mockResolvedValue(null);

      await expect(
        service.updateSiteName('MISSING', { new_name: 'New' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteSite', () => {
    it('deletes an existing site', async () => {
      prisma.site.findUnique.mockResolvedValue(makeSite());
      prisma.site.delete.mockResolvedValue(makeSite());

      await service.deleteSite('UK12345');

      expect(prisma.site.delete).toHaveBeenCalledWith({
        where: { plant_no: 'UK12345' },
      });
    });

    it('throws NotFoundException for non-existent site', async () => {
      prisma.site.findUnique.mockResolvedValue(null);

      await expect(service.deleteSite('MISSING')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
