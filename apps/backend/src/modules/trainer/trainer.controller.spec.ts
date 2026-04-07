import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TrainerController } from './trainer.controller';
import { TrainerService } from './trainer.service';

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

describe('TrainerController', () => {
  let controller: TrainerController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    findById: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrainerController],
      providers: [{ provide: TrainerService, useValue: service }],
    }).compile();

    controller = module.get<TrainerController>(TrainerController);
  });

  describe('POST /trainers', () => {
    it('returns 201 with created trainer as response DTO', async () => {
      service.create.mockResolvedValue(makeTrainer());

      const result = await controller.create({
        first_name: 'Alice',
        last_name: 'Brown',
        location_id: 'APHA001',
      });

      expect(result.trainer_id).toBe(1);
      expect(result.display_name).toBe('Brown, Alice');
      expect(result.person_id).toBeNull();
      expect(result).not.toHaveProperty('created_at');
      expect(result).not.toHaveProperty('updated_at');
    });

    it('propagates NotFoundException for invalid location', async () => {
      service.create.mockRejectedValue(new NotFoundException());

      await expect(
        controller.create({
          first_name: 'Alice',
          last_name: 'Brown',
          location_id: 'MISSING',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('GET /trainers', () => {
    it('returns trainer list mapped through response DTO', async () => {
      service.findAll.mockResolvedValue([
        makeTrainer(),
        makeTrainer({ trainer_id: 2, person_id: 5 }),
      ]);

      const result = await controller.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('created_at');
      expect(result[1].person_id).toBe(5);
    });
  });

  describe('GET /trainers/:id', () => {
    it('returns trainer response DTO', async () => {
      service.findById.mockResolvedValue(makeTrainer());

      const result = await controller.findOne(1);

      expect(result.trainer_id).toBe(1);
      expect(result).not.toHaveProperty('created_at');
    });

    it('propagates NotFoundException', async () => {
      service.findById.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('DELETE /trainers/:id', () => {
    it('calls service delete', async () => {
      service.delete.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(service.delete).toHaveBeenCalledWith(1);
    });

    it('propagates NotFoundException', async () => {
      service.delete.mockRejectedValue(new NotFoundException());

      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
