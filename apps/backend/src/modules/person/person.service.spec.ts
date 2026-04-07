import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PersonService } from './person.service';
import { PrismaService } from '../../prisma/prisma.service';

const makePerson = (overrides: Partial<Record<string, unknown>> = {}) => ({
  person_id: 1,
  first_name: 'John',
  last_name: 'Smith',
  display_name: 'Smith, John',
  site_id: 'UK12345',
  has_training: false,
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

describe('PersonService', () => {
  let service: PersonService;
  let prisma: {
    site: { findUnique: jest.Mock };
    person: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      site: { findUnique: jest.fn() },
      person: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PersonService>(PersonService);
  });

  describe('create', () => {
    it('creates a person with computed display_name (BR-010)', async () => {
      prisma.site.findUnique.mockResolvedValue({ plant_no: 'UK12345' });
      const person = makePerson();
      prisma.person.create.mockResolvedValue(person);

      const result = await service.create({
        first_name: 'John',
        last_name: 'Smith',
        site_id: 'UK12345',
      });

      expect(result.display_name).toBe('Smith, John');
      expect(prisma.person.create).toHaveBeenCalledWith({
        data: {
          first_name: 'John',
          last_name: 'Smith',
          display_name: 'Smith, John',
          site_id: 'UK12345',
          has_training: false,
        },
      });
    });

    it('throws NotFoundException for non-existent site', async () => {
      prisma.site.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          first_name: 'John',
          last_name: 'Smith',
          site_id: 'MISSING',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('returns persons filtered by site_id', async () => {
      const persons = [makePerson()];
      prisma.person.findMany.mockResolvedValue(persons);

      const result = await service.findAll('UK12345');

      expect(result).toEqual(persons);
      expect(prisma.person.findMany).toHaveBeenCalledWith({
        where: { site_id: 'UK12345' },
        orderBy: { display_name: 'asc' },
      });
    });

    it('returns persons filtered by name (case-insensitive contains)', async () => {
      prisma.person.findMany.mockResolvedValue([]);

      await service.findAll(undefined, 'smith');

      expect(prisma.person.findMany).toHaveBeenCalledWith({
        where: { display_name: { contains: 'smith', mode: 'insensitive' } },
        orderBy: { display_name: 'asc' },
      });
    });

    it('returns all persons when no filters given', async () => {
      prisma.person.findMany.mockResolvedValue([]);

      await service.findAll();

      expect(prisma.person.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { display_name: 'asc' },
      });
    });
  });

  describe('findBySite', () => {
    it('returns persons for a given site ordered by display_name', async () => {
      const persons = [makePerson(), makePerson({ person_id: 2, display_name: 'Adams, Jane' })];
      prisma.person.findMany.mockResolvedValue(persons);

      const result = await service.findBySite('UK12345');

      expect(result).toEqual(persons);
      expect(prisma.person.findMany).toHaveBeenCalledWith({
        where: { site_id: 'UK12345' },
        orderBy: { display_name: 'asc' },
      });
    });
  });

  describe('findById', () => {
    it('returns a person when found', async () => {
      const person = makePerson();
      prisma.person.findUnique.mockResolvedValue(person);

      const result = await service.findById(1);

      expect(result).toEqual(person);
    });

    it('throws NotFoundException when not found', async () => {
      prisma.person.findUnique.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('recomputes display_name when name fields change', async () => {
      prisma.person.findUnique.mockResolvedValue(makePerson());
      const updated = makePerson({
        last_name: 'Jones',
        display_name: 'Jones, John',
      });
      prisma.person.update.mockResolvedValue(updated);

      const result = await service.update(1, { last_name: 'Jones' });

      expect(result.display_name).toBe('Jones, John');
      expect(prisma.person.update).toHaveBeenCalledWith({
        where: { person_id: 1 },
        data: {
          last_name: 'Jones',
          display_name: 'Jones, John',
        },
      });
    });

    it('validates site_id when changed', async () => {
      prisma.person.findUnique.mockResolvedValue(makePerson());
      prisma.site.findUnique.mockResolvedValue(null);

      await expect(
        service.update(1, { site_id: 'MISSING' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException for non-existent person', async () => {
      prisma.person.findUnique.mockResolvedValue(null);

      await expect(
        service.update(999, { first_name: 'Jane' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('deletes a person with no training records', async () => {
      prisma.person.findUnique.mockResolvedValue(makePerson());
      prisma.person.delete.mockResolvedValue(makePerson());

      await service.delete(1);

      expect(prisma.person.delete).toHaveBeenCalledWith({
        where: { person_id: 1 },
      });
    });

    it('throws ConflictException when person has training records (BR-012)', async () => {
      prisma.person.findUnique.mockResolvedValue(
        makePerson({ has_training: true }),
      );

      await expect(service.delete(1)).rejects.toThrow(
        new ConflictException(
          'Training records must be deleted before a person can be removed.',
        ),
      );
      expect(prisma.person.delete).not.toHaveBeenCalled();
    });

    it('throws NotFoundException for non-existent person', async () => {
      prisma.person.findUnique.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('checkDuplicate', () => {
    it('returns isDuplicate true when matches exist (BR-DUP)', async () => {
      prisma.person.findMany.mockResolvedValue([makePerson()]);

      const result = await service.checkDuplicate('John', 'Smith', 'UK12345');

      expect(result.isDuplicate).toBe(true);
      expect(result.existing).toHaveLength(1);
    });

    it('performs case-insensitive matching', async () => {
      prisma.person.findMany.mockResolvedValue([]);

      await service.checkDuplicate('john', 'smith', 'UK12345');

      expect(prisma.person.findMany).toHaveBeenCalledWith({
        where: {
          first_name: { equals: 'john', mode: 'insensitive' },
          last_name: { equals: 'smith', mode: 'insensitive' },
          site_id: 'UK12345',
        },
      });
    });

    it('returns isDuplicate false when no matches', async () => {
      prisma.person.findMany.mockResolvedValue([]);

      const result = await service.checkDuplicate('Jane', 'Doe', 'UK12345');

      expect(result.isDuplicate).toBe(false);
      expect(result.existing).toHaveLength(0);
    });
  });
});
