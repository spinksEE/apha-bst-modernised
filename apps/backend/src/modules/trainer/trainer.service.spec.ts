import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TrainerService } from './trainer.service';
import { PrismaService } from '../../prisma/prisma.service';

const makeTrainer = (overrides: Partial<Record<string, unknown>> = {}) => ({
  trainer_id: 1,
  first_name: 'Alice',
  last_name: 'Brown',
  display_name: 'Brown, Alice',
  location_id: 'APHA001',
  person_id: null,
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

describe('TrainerService', () => {
  let service: TrainerService;
  let prisma: {
    site: { findUnique: jest.Mock };
    person: { findUnique: jest.Mock };
    trainer: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      site: { findUnique: jest.fn() },
      person: { findUnique: jest.fn() },
      trainer: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrainerService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TrainerService>(TrainerService);
  });

  describe('create', () => {
    it('creates an APHA staff trainer with person_id null', async () => {
      prisma.site.findUnique.mockResolvedValue({ plant_no: 'APHA001' });
      const trainer = makeTrainer();
      prisma.trainer.create.mockResolvedValue(trainer);

      const result = await service.create({
        first_name: 'Alice',
        last_name: 'Brown',
        location_id: 'APHA001',
      });

      expect(result.display_name).toBe('Brown, Alice');
      expect(result.person_id).toBeNull();
      expect(prisma.trainer.create).toHaveBeenCalledWith({
        data: {
          first_name: 'Alice',
          last_name: 'Brown',
          display_name: 'Brown, Alice',
          location_id: 'APHA001',
          person_id: null,
        },
      });
    });

    it('creates a cascade trainer with person_id link', async () => {
      prisma.site.findUnique.mockResolvedValue({ plant_no: 'UK12345' });
      prisma.person.findUnique.mockResolvedValue({ person_id: 5 });
      const trainer = makeTrainer({ person_id: 5, location_id: 'UK12345' });
      prisma.trainer.create.mockResolvedValue(trainer);

      const result = await service.create({
        first_name: 'Alice',
        last_name: 'Brown',
        location_id: 'UK12345',
        person_id: 5,
      });

      expect(result.person_id).toBe(5);
      expect(prisma.person.findUnique).toHaveBeenCalledWith({
        where: { person_id: 5 },
      });
    });

    it('computes display_name as "Last, First"', async () => {
      prisma.site.findUnique.mockResolvedValue({ plant_no: 'APHA001' });
      prisma.trainer.create.mockResolvedValue(makeTrainer());

      await service.create({
        first_name: 'Alice',
        last_name: 'Brown',
        location_id: 'APHA001',
      });

      expect(prisma.trainer.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            display_name: 'Brown, Alice',
          }),
        }),
      );
    });

    it('throws NotFoundException for invalid location_id', async () => {
      prisma.site.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          first_name: 'Alice',
          last_name: 'Brown',
          location_id: 'MISSING',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException for invalid person_id', async () => {
      prisma.site.findUnique.mockResolvedValue({ plant_no: 'UK12345' });
      prisma.person.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          first_name: 'Alice',
          last_name: 'Brown',
          location_id: 'UK12345',
          person_id: 999,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('returns all trainers ordered by display_name', async () => {
      const trainers = [
        makeTrainer({ display_name: 'Adams, Bob' }),
        makeTrainer({ trainer_id: 2, display_name: 'Brown, Alice' }),
      ];
      prisma.trainer.findMany.mockResolvedValue(trainers);

      const result = await service.findAll();

      expect(result).toEqual(trainers);
      expect(prisma.trainer.findMany).toHaveBeenCalledWith({
        orderBy: { display_name: 'asc' },
      });
    });
  });

  describe('findById', () => {
    it('returns a trainer when found', async () => {
      const trainer = makeTrainer();
      prisma.trainer.findUnique.mockResolvedValue(trainer);

      const result = await service.findById(1);

      expect(result).toEqual(trainer);
    });

    it('throws NotFoundException when not found', async () => {
      prisma.trainer.findUnique.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('deletes an existing trainer', async () => {
      prisma.trainer.findUnique.mockResolvedValue(makeTrainer());
      prisma.trainer.delete.mockResolvedValue(makeTrainer());

      await service.delete(1);

      expect(prisma.trainer.delete).toHaveBeenCalledWith({
        where: { trainer_id: 1 },
      });
    });

    it('throws NotFoundException for non-existent trainer', async () => {
      prisma.trainer.findUnique.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });
});
