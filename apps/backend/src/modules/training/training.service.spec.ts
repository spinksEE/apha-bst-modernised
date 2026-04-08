import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { TrainingType, Species } from '@prisma/client';
import { TrainingService } from './training.service';
import { PrismaService } from '../../prisma/prisma.service';

const makeTraining = (overrides: Partial<Record<string, unknown>> = {}) => ({
  training_id: 1,
  trainee_id: 10,
  trainer_id: 1,
  date_trained: new Date('2025-06-15'),
  species_trained: [Species.Cattle],
  training_type: TrainingType.Trained,
  is_deleted: false,
  created_by: 'system',
  created_at: new Date(),
  modified_by: 'system',
  modified_at: new Date(),
  deleted_by: null,
  deleted_at: null,
  trainee: { display_name: 'Wilson, James' },
  trainer: { display_name: 'Brown, Alice' },
  ...overrides,
});

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

describe('TrainingService', () => {
  let service: TrainingService;
  let prisma: {
    person: { findUnique: jest.Mock; update: jest.Mock };
    trainer: { findUnique: jest.Mock };
    training: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      count: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      person: { findUnique: jest.fn(), update: jest.fn() },
      trainer: { findUnique: jest.fn() },
      training: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrainingService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TrainingService>(TrainingService);
  });

  describe('create', () => {
    const dto = {
      trainee_id: 10,
      trainer_id: 1,
      date_trained: '2025-06-15',
      species_trained: [Species.Cattle],
      training_type: TrainingType.Trained,
    };

    beforeEach(() => {
      prisma.person.findUnique.mockResolvedValue({ person_id: 10 });
      prisma.trainer.findUnique.mockResolvedValue(makeTrainer());
      prisma.training.findMany.mockResolvedValue([]);
    });

    it('creates a training record and recomputes has_training', async () => {
      const training = makeTraining();
      const txPrisma = {
        training: { create: jest.fn().mockResolvedValue(training), count: jest.fn().mockResolvedValue(1) },
        person: { update: jest.fn() },
      };
      prisma.$transaction.mockImplementation((fn: (tx: typeof txPrisma) => Promise<unknown>) => fn(txPrisma));

      const result = await service.create(dto);

      expect(result.training_id).toBe(1);
      expect(txPrisma.training.create).toHaveBeenCalledWith({
        data: {
          trainee_id: 10,
          trainer_id: 1,
          date_trained: new Date('2025-06-15'),
          species_trained: [Species.Cattle],
          training_type: TrainingType.Trained,
        },
        include: {
          trainee: { select: { display_name: true } },
          trainer: { select: { display_name: true } },
        },
      });
      expect(txPrisma.person.update).toHaveBeenCalledWith({
        where: { person_id: 10 },
        data: { has_training: true },
      });
    });

    it('sorts species before storage (D1)', async () => {
      const unsortedDto = {
        ...dto,
        species_trained: [Species.Goat, Species.Cattle, Species.Sheep],
      };
      const txPrisma = {
        training: { create: jest.fn().mockResolvedValue(makeTraining()), count: jest.fn().mockResolvedValue(1) },
        person: { update: jest.fn() },
      };
      prisma.$transaction.mockImplementation((fn: (tx: typeof txPrisma) => Promise<unknown>) => fn(txPrisma));

      await service.create(unsortedDto);

      expect(txPrisma.training.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            species_trained: [Species.Cattle, Species.Sheep, Species.Goat],
          }),
        }),
      );
    });

    it('throws NotFoundException for invalid trainee', async () => {
      prisma.person.findUnique.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException for invalid trainer', async () => {
      prisma.trainer.findUnique.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException for future date (BR-014)', async () => {
      const futureDto = { ...dto, date_trained: '2099-12-31' };

      await expect(service.create(futureDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(futureDto)).rejects.toThrow(
        'Training Date cannot be in the future.',
      );
    });

    it('throws BadRequestException for self-training (BR-001)', async () => {
      prisma.trainer.findUnique.mockResolvedValue(
        makeTrainer({ person_id: 10 }),
      );

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow(
        'Trainer and Trainee cannot be the same person.',
      );
    });

    it('allows APHA staff trainer (null person_id) with same trainee (D2)', async () => {
      prisma.trainer.findUnique.mockResolvedValue(
        makeTrainer({ person_id: null }),
      );
      const txPrisma = {
        training: { create: jest.fn().mockResolvedValue(makeTraining()), count: jest.fn().mockResolvedValue(1) },
        person: { update: jest.fn() },
      };
      prisma.$transaction.mockImplementation((fn: (tx: typeof txPrisma) => Promise<unknown>) => fn(txPrisma));

      await expect(service.create(dto)).resolves.toBeDefined();
    });

    it('throws ConflictException for duplicate record (D3)', async () => {
      prisma.training.findMany.mockResolvedValue([
        makeTraining({ species_trained: [Species.Cattle] }),
      ]);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      await expect(service.create(dto)).rejects.toThrow(
        'A training record for this person, training type, species, and date already exists.',
      );
    });

    it('allows records with different species (not a duplicate)', async () => {
      prisma.training.findMany.mockResolvedValue([
        makeTraining({ species_trained: [Species.Sheep] }),
      ]);
      const txPrisma = {
        training: { create: jest.fn().mockResolvedValue(makeTraining()), count: jest.fn().mockResolvedValue(1) },
        person: { update: jest.fn() },
      };
      prisma.$transaction.mockImplementation((fn: (tx: typeof txPrisma) => Promise<unknown>) => fn(txPrisma));

      await expect(service.create(dto)).resolves.toBeDefined();
    });

    describe('cascade eligibility (BR-005)', () => {
      const cascadeDto = {
        ...dto,
        training_type: TrainingType.CascadeTrained,
      };

      it('throws BadRequestException when trainer lacks species qualification', async () => {
        prisma.trainer.findUnique.mockResolvedValue(
          makeTrainer({ person_id: 20, trainer_id: 1 }),
        );
        prisma.training.findMany.mockResolvedValue([]); // no training records

        await expect(service.create(cascadeDto)).rejects.toThrow(
          new BadRequestException(
            'Trainer is not qualified to deliver training for Cattle.',
          ),
        );
      });

      it('allows cascade when trainer holds qualification for all species', async () => {
        prisma.trainer.findUnique
          .mockResolvedValueOnce(makeTrainer({ person_id: 20, trainer_id: 1 }))
          .mockResolvedValueOnce(makeTrainer({ person_id: 20, trainer_id: 1 }));
        prisma.training.findMany
          .mockResolvedValueOnce([makeTraining({ trainee_id: 20, species_trained: [Species.Cattle] })]) // cascade check
          .mockResolvedValueOnce([]); // duplicate check

        const txPrisma = {
          training: { create: jest.fn().mockResolvedValue(makeTraining()), count: jest.fn().mockResolvedValue(1) },
          person: { update: jest.fn() },
        };
        prisma.$transaction.mockImplementation((fn: (tx: typeof txPrisma) => Promise<unknown>) => fn(txPrisma));

        await expect(service.create(cascadeDto)).resolves.toBeDefined();
      });

      it('exempts APHA staff trainers (null person_id) from cascade check', async () => {
        prisma.trainer.findUnique
          .mockResolvedValueOnce(makeTrainer({ person_id: null }))
          .mockResolvedValueOnce(makeTrainer({ person_id: null }));
        prisma.training.findMany.mockResolvedValue([]); // duplicate check

        const txPrisma = {
          training: { create: jest.fn().mockResolvedValue(makeTraining()), count: jest.fn().mockResolvedValue(1) },
          person: { update: jest.fn() },
        };
        prisma.$transaction.mockImplementation((fn: (tx: typeof txPrisma) => Promise<unknown>) => fn(txPrisma));

        await expect(service.create(cascadeDto)).resolves.toBeDefined();
      });
    });
  });

  describe('findByTrainee', () => {
    it('returns non-deleted training records ordered by date desc', async () => {
      prisma.person.findUnique.mockResolvedValue({ person_id: 10 });
      const trainings = [makeTraining(), makeTraining({ training_id: 2 })];
      prisma.training.findMany.mockResolvedValue(trainings);

      const result = await service.findByTrainee(10);

      expect(result).toEqual(trainings);
      expect(prisma.training.findMany).toHaveBeenCalledWith({
        where: { trainee_id: 10, is_deleted: false },
        orderBy: { date_trained: 'desc' },
        include: {
          trainer: { select: { display_name: true } },
          trainee: { select: { display_name: true } },
        },
      });
    });

    it('throws NotFoundException for invalid trainee', async () => {
      prisma.person.findUnique.mockResolvedValue(null);

      await expect(service.findByTrainee(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findById', () => {
    it('returns a training record with relations', async () => {
      const training = makeTraining();
      prisma.training.findUnique.mockResolvedValue(training);

      const result = await service.findById(1);

      expect(result.training_id).toBe(1);
      expect(result.trainee).toEqual({ display_name: 'Wilson, James' });
    });

    it('throws NotFoundException when not found', async () => {
      prisma.training.findUnique.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    beforeEach(() => {
      prisma.training.findUnique.mockResolvedValue(makeTraining());
      prisma.trainer.findUnique.mockResolvedValue(makeTrainer());
      prisma.training.findMany.mockResolvedValue([]);
    });

    it('updates a training record', async () => {
      const updated = makeTraining({ training_type: TrainingType.TrainingConfirmed });
      const txPrisma = {
        training: { update: jest.fn().mockResolvedValue(updated), count: jest.fn().mockResolvedValue(1) },
        person: { update: jest.fn() },
      };
      prisma.$transaction.mockImplementation((fn: (tx: typeof txPrisma) => Promise<unknown>) => fn(txPrisma));

      const result = await service.update(1, {
        training_type: TrainingType.TrainingConfirmed,
      });

      expect(result.training_type).toBe(TrainingType.TrainingConfirmed);
    });

    it('throws BadRequestException when updating a deleted record', async () => {
      prisma.training.findUnique.mockResolvedValue(
        makeTraining({ is_deleted: true }),
      );

      await expect(
        service.update(1, { training_type: TrainingType.TrainingConfirmed }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.update(1, { training_type: TrainingType.TrainingConfirmed }),
      ).rejects.toThrow('Cannot update a deleted training record.');
    });

    it('recomputes has_training for both old and new trainee when trainee changes', async () => {
      prisma.person.findUnique.mockResolvedValue({ person_id: 20 });
      const updated = makeTraining({ trainee_id: 20 });
      const txPrisma = {
        training: { update: jest.fn().mockResolvedValue(updated), count: jest.fn() },
        person: { update: jest.fn() },
      };
      txPrisma.training.count
        .mockResolvedValueOnce(1)  // new trainee
        .mockResolvedValueOnce(0); // old trainee
      prisma.$transaction.mockImplementation((fn: (tx: typeof txPrisma) => Promise<unknown>) => fn(txPrisma));

      await service.update(1, { trainee_id: 20 });

      // Should have been called twice: once for new trainee, once for old trainee
      expect(txPrisma.person.update).toHaveBeenCalledTimes(2);
      expect(txPrisma.person.update).toHaveBeenCalledWith({
        where: { person_id: 20 },
        data: { has_training: true },
      });
      expect(txPrisma.person.update).toHaveBeenCalledWith({
        where: { person_id: 10 },
        data: { has_training: false },
      });
    });

    it('validates self-training on update (BR-001)', async () => {
      prisma.trainer.findUnique.mockResolvedValue(
        makeTrainer({ person_id: 10 }),
      );

      await expect(
        service.update(1, { trainer_id: 1 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('checks duplicate excluding current record', async () => {
      prisma.training.findMany.mockResolvedValue([
        makeTraining({ training_id: 2, species_trained: [Species.Cattle] }),
      ]);

      await expect(
        service.update(1, { date_trained: '2025-06-15' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('softDelete', () => {
    it('soft-deletes a training record and recomputes has_training', async () => {
      prisma.training.findUnique.mockResolvedValue(makeTraining());
      const deleted = makeTraining({ is_deleted: true, deleted_by: 'system' });
      const txPrisma = {
        training: { update: jest.fn().mockResolvedValue(deleted), count: jest.fn().mockResolvedValue(0) },
        person: { update: jest.fn() },
      };
      prisma.$transaction.mockImplementation((fn: (tx: typeof txPrisma) => Promise<unknown>) => fn(txPrisma));

      const result = await service.softDelete(1);

      expect(result.is_deleted).toBe(true);
      expect(txPrisma.training.update).toHaveBeenCalledWith({
        where: { training_id: 1 },
        data: {
          is_deleted: true,
          deleted_by: 'system',
          deleted_at: expect.any(Date),
        },
        include: {
          trainee: { select: { display_name: true } },
          trainer: { select: { display_name: true } },
        },
      });
      expect(txPrisma.person.update).toHaveBeenCalledWith({
        where: { person_id: 10 },
        data: { has_training: false },
      });
    });

    it('throws BadRequestException when already deleted', async () => {
      prisma.training.findUnique.mockResolvedValue(
        makeTraining({ is_deleted: true }),
      );

      await expect(service.softDelete(1)).rejects.toThrow(BadRequestException);
      await expect(service.softDelete(1)).rejects.toThrow(
        'Training record is already deleted.',
      );
    });

    it('throws NotFoundException when not found', async () => {
      prisma.training.findUnique.mockResolvedValue(null);

      await expect(service.softDelete(999)).rejects.toThrow(NotFoundException);
    });
  });
});
