import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { TrainingType, Species } from '@prisma/client';
import { TrainingController } from './training.controller';
import { TrainingService } from './training.service';

const makeTraining = (overrides: Partial<Record<string, unknown>> = {}) => ({
  training_id: 1,
  trainee_id: 10,
  trainer_id: 1,
  date_trained: new Date('2025-06-15'),
  species_trained: [Species.Cattle],
  training_type: TrainingType.Trained,
  is_deleted: false,
  created_by: 'system',
  created_at: new Date('2025-06-15T10:00:00Z'),
  modified_by: 'system',
  modified_at: new Date('2025-06-15T10:00:00Z'),
  deleted_by: null,
  deleted_at: null,
  trainee: { display_name: 'Wilson, James' },
  trainer: { display_name: 'Brown, Alice' },
  ...overrides,
});

describe('TrainingController', () => {
  let controller: TrainingController;
  let service: {
    create: jest.Mock;
    findByTrainee: jest.Mock;
    findById: jest.Mock;
    update: jest.Mock;
    softDelete: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findByTrainee: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrainingController],
      providers: [{ provide: TrainingService, useValue: service }],
    }).compile();

    controller = module.get<TrainingController>(TrainingController);
  });

  describe('POST /trainings', () => {
    it('returns 201 with created training as response DTO', async () => {
      service.create.mockResolvedValue(makeTraining());

      const result = await controller.create({
        trainee_id: 10,
        trainer_id: 1,
        date_trained: '2025-06-15',
        species_trained: [Species.Cattle],
        training_type: TrainingType.Trained,
      });

      expect(result.training_id).toBe(1);
      expect(result.date_trained).toBe('2025-06-15');
      expect(result.trainer_display_name).toBe('Brown, Alice');
      expect(result.trainee_display_name).toBe('Wilson, James');
      expect(result).not.toHaveProperty('trainee');
      expect(result).not.toHaveProperty('trainer');
    });

    it('propagates BadRequestException for self-training (BR-001)', async () => {
      service.create.mockRejectedValue(
        new BadRequestException('Trainer and Trainee cannot be the same person.'),
      );

      await expect(
        controller.create({
          trainee_id: 10,
          trainer_id: 1,
          date_trained: '2025-06-15',
          species_trained: [Species.Cattle],
          training_type: TrainingType.Trained,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('propagates ConflictException for duplicate record', async () => {
      service.create.mockRejectedValue(new ConflictException());

      await expect(
        controller.create({
          trainee_id: 10,
          trainer_id: 1,
          date_trained: '2025-06-15',
          species_trained: [Species.Cattle],
          training_type: TrainingType.Trained,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('propagates NotFoundException for invalid trainee', async () => {
      service.create.mockRejectedValue(new NotFoundException());

      await expect(
        controller.create({
          trainee_id: 999,
          trainer_id: 1,
          date_trained: '2025-06-15',
          species_trained: [Species.Cattle],
          training_type: TrainingType.Trained,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('GET /trainings/by-trainee', () => {
    it('returns training list items mapped through list DTO', async () => {
      service.findByTrainee.mockResolvedValue([
        makeTraining(),
        makeTraining({ training_id: 2 }),
      ]);

      const result = await controller.findByTrainee(10);

      expect(result).toHaveLength(2);
      expect(result[0].training_id).toBe(1);
      expect(result[0].trainer_display_name).toBe('Brown, Alice');
      expect(result[0]).not.toHaveProperty('trainee_id');
      expect(result[0]).not.toHaveProperty('created_at');
    });

    it('propagates NotFoundException for invalid trainee', async () => {
      service.findByTrainee.mockRejectedValue(new NotFoundException());

      await expect(controller.findByTrainee(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('GET /trainings/:id', () => {
    it('returns training response DTO', async () => {
      service.findById.mockResolvedValue(makeTraining());

      const result = await controller.findOne(1);

      expect(result.training_id).toBe(1);
      expect(result.date_trained).toBe('2025-06-15');
      expect(result.species_trained).toEqual([Species.Cattle]);
      expect(result.created_at).toBeDefined();
    });

    it('propagates NotFoundException', async () => {
      service.findById.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('PATCH /trainings/:id', () => {
    it('returns updated training response DTO', async () => {
      service.update.mockResolvedValue(
        makeTraining({ training_type: TrainingType.TrainingConfirmed }),
      );

      const result = await controller.update(1, {
        training_type: TrainingType.TrainingConfirmed,
      });

      expect(result.training_type).toBe(TrainingType.TrainingConfirmed);
    });

    it('propagates BadRequestException for deleted record update', async () => {
      service.update.mockRejectedValue(
        new BadRequestException('Cannot update a deleted training record.'),
      );

      await expect(controller.update(1, {})).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('DELETE /trainings/:id', () => {
    it('calls service softDelete', async () => {
      service.softDelete.mockResolvedValue(undefined);

      await controller.softDelete(1);

      expect(service.softDelete).toHaveBeenCalledWith(1);
    });

    it('propagates NotFoundException', async () => {
      service.softDelete.mockRejectedValue(new NotFoundException());

      await expect(controller.softDelete(999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('propagates BadRequestException for already-deleted record', async () => {
      service.softDelete.mockRejectedValue(
        new BadRequestException('Training record is already deleted.'),
      );

      await expect(controller.softDelete(1)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
