import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { SiteController } from './site.controller';
import { SiteService } from './site.service';

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

describe('SiteController', () => {
  let controller: SiteController;
  let service: {
    createSite: jest.Mock;
    findAll: jest.Mock;
    findByPlantNo: jest.Mock;
    searchSites: jest.Mock;
    updateSite: jest.Mock;
    updateSiteName: jest.Mock;
    deleteSite: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      createSite: jest.fn(),
      findAll: jest.fn(),
      findByPlantNo: jest.fn(),
      searchSites: jest.fn(),
      updateSite: jest.fn(),
      updateSiteName: jest.fn(),
      deleteSite: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SiteController],
      providers: [{ provide: SiteService, useValue: service }],
    }).compile();

    controller = module.get<SiteController>(SiteController);
  });

  describe('POST /sites', () => {
    it('returns the created site as a response DTO', async () => {
      const site = makeSite();
      service.createSite.mockResolvedValue(site);

      const result = await controller.create({
        plant_no: 'UK12345',
        name: 'Test Abattoir Ltd',
      });

      expect(result.plant_no).toBe('UK12345');
      expect(result.name).toBe('Test Abattoir Ltd');
      // Response DTO should not include timestamps
      expect(result).not.toHaveProperty('created_at');
      expect(result).not.toHaveProperty('updated_at');
    });

    it('propagates ConflictException from service', async () => {
      service.createSite.mockRejectedValue(
        new ConflictException('A site with this Plant Number already exists.'),
      );

      await expect(
        controller.create({ plant_no: 'UK12345', name: 'Duplicate' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('GET /sites', () => {
    it('returns list items from service', async () => {
      const items = [{ plant_no: 'A1', name: 'Alpha' }];
      service.findAll.mockResolvedValue(items);

      const result = await controller.findAll();

      expect(result).toEqual(items);
    });
  });

  describe('GET /sites/search', () => {
    it('passes query params to service', async () => {
      service.searchSites.mockResolvedValue([]);

      await controller.search({ plant_no: 'UK12345', name: 'test' });

      expect(service.searchSites).toHaveBeenCalledWith({
        plant_no: 'UK12345',
        name: 'test',
      });
    });
  });

  describe('GET /sites/:plantNo', () => {
    it('returns site response DTO', async () => {
      service.findByPlantNo.mockResolvedValue(makeSite());

      const result = await controller.findOne('UK12345');

      expect(result.plant_no).toBe('UK12345');
      expect(result).not.toHaveProperty('created_at');
    });

    it('propagates NotFoundException', async () => {
      service.findByPlantNo.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('MISSING')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('PATCH /sites/:plantNo', () => {
    it('returns updated site response DTO', async () => {
      service.updateSite.mockResolvedValue(
        makeSite({ address_town: 'Oxton' }),
      );

      const result = await controller.update('UK12345', {
        address_town: 'Oxton',
      });

      expect(result.address_town).toBe('Oxton');
    });
  });

  describe('PATCH /sites/:plantNo/name', () => {
    it('returns evolved site response DTO', async () => {
      service.updateSiteName.mockResolvedValue(
        makeSite({ name: 'New Name [Old Name]' }),
      );

      const result = await controller.updateName('UK12345', {
        new_name: 'New Name',
      });

      expect(result.name).toBe('New Name [Old Name]');
    });
  });

  describe('DELETE /sites/:plantNo', () => {
    it('calls service deleteSite', async () => {
      service.deleteSite.mockResolvedValue(undefined);

      await controller.remove('UK12345');

      expect(service.deleteSite).toHaveBeenCalledWith('UK12345');
    });

    it('propagates NotFoundException', async () => {
      service.deleteSite.mockRejectedValue(new NotFoundException());

      await expect(controller.remove('MISSING')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
