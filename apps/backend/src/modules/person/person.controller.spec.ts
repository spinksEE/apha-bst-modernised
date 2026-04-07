import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PersonController } from './person.controller';
import { PersonService } from './person.service';

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

describe('PersonController', () => {
  let controller: PersonController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    findById: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    checkDuplicate: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      checkDuplicate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PersonController],
      providers: [{ provide: PersonService, useValue: service }],
    }).compile();

    controller = module.get<PersonController>(PersonController);
  });

  describe('POST /persons', () => {
    it('returns 201 with created person as response DTO', async () => {
      service.create.mockResolvedValue(makePerson());

      const result = await controller.create({
        first_name: 'John',
        last_name: 'Smith',
        site_id: 'UK12345',
      });

      expect(result.person_id).toBe(1);
      expect(result.display_name).toBe('Smith, John');
      expect(result).not.toHaveProperty('created_at');
      expect(result).not.toHaveProperty('updated_at');
    });

    it('propagates NotFoundException for invalid site', async () => {
      service.create.mockRejectedValue(new NotFoundException());

      await expect(
        controller.create({
          first_name: 'John',
          last_name: 'Smith',
          site_id: 'MISSING',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('GET /persons', () => {
    it('returns person list items mapped through response DTO', async () => {
      service.findAll.mockResolvedValue([makePerson()]);

      const result = await controller.findAll('UK12345');

      expect(result).toHaveLength(1);
      expect(result[0].display_name).toBe('Smith, John');
      expect(result[0]).not.toHaveProperty('created_at');
    });

    it('passes query params to service', async () => {
      service.findAll.mockResolvedValue([]);

      await controller.findAll('UK12345', 'smith');

      expect(service.findAll).toHaveBeenCalledWith('UK12345', 'smith');
    });
  });

  describe('GET /persons/check-duplicate', () => {
    it('returns duplicate check result', async () => {
      const dupResult = { isDuplicate: true, existing: [makePerson()] };
      service.checkDuplicate.mockResolvedValue(dupResult);

      const result = await controller.checkDuplicate({
        first_name: 'John',
        last_name: 'Smith',
        site_id: 'UK12345',
      });

      expect(result.isDuplicate).toBe(true);
      expect(service.checkDuplicate).toHaveBeenCalledWith(
        'John',
        'Smith',
        'UK12345',
      );
    });
  });

  describe('GET /persons/:id', () => {
    it('returns person response DTO', async () => {
      service.findById.mockResolvedValue(makePerson());

      const result = await controller.findOne(1);

      expect(result.person_id).toBe(1);
      expect(result).not.toHaveProperty('created_at');
    });

    it('propagates NotFoundException', async () => {
      service.findById.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('PATCH /persons/:id', () => {
    it('returns updated person response DTO', async () => {
      service.update.mockResolvedValue(
        makePerson({ last_name: 'Jones', display_name: 'Jones, John' }),
      );

      const result = await controller.update(1, { last_name: 'Jones' });

      expect(result.display_name).toBe('Jones, John');
    });
  });

  describe('DELETE /persons/:id', () => {
    it('calls service delete', async () => {
      service.delete.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(service.delete).toHaveBeenCalledWith(1);
    });

    it('propagates ConflictException for training dependency (BR-012)', async () => {
      service.delete.mockRejectedValue(
        new ConflictException(
          'Training records must be deleted before a person can be removed.',
        ),
      );

      await expect(controller.remove(1)).rejects.toThrow(ConflictException);
    });

    it('propagates NotFoundException', async () => {
      service.delete.mockRejectedValue(new NotFoundException());

      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
