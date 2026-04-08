import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Site Management (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.site.deleteMany();
  });

  afterAll(async () => {
    await prisma.site.deleteMany();
    await app.close();
  });

  describe('POST /api/sites', () => {
    it('creates a new site and returns 201', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/sites')
        .send({
          plant_no: 'UK12345',
          name: 'Test Abattoir Ltd',
          address_town: 'Oxton',
          is_apha_site: true,
        })
        .expect(201);

      expect(response.body.plant_no).toBe('UK12345');
      expect(response.body.name).toBe('Test Abattoir Ltd');
      expect(response.body.address_town).toBe('Oxton');
      expect(response.body.is_apha_site).toBe(true);
      // Should not expose timestamps
      expect(response.body).not.toHaveProperty('created_at');
      expect(response.body).not.toHaveProperty('updated_at');
    });

    it('returns 409 for duplicate plant number (BR-006)', async () => {
      await request(app.getHttpServer())
        .post('/api/sites')
        .send({ plant_no: 'UK12345', name: 'Site A' })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/api/sites')
        .send({ plant_no: 'UK12345', name: 'Site B' })
        .expect(409);

      expect(response.body.message).toBe(
        'A site with this Plant Number already exists.',
      );
    });

    it('returns 409 for duplicate name (BR-015)', async () => {
      await request(app.getHttpServer())
        .post('/api/sites')
        .send({ plant_no: 'UK11111', name: 'Same Name' })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/api/sites')
        .send({ plant_no: 'UK22222', name: 'Same Name' })
        .expect(409);

      expect(response.body.message).toBe(
        'A site with this Name already exists.',
      );
    });

    it('returns 400 for invalid plant_no (non-alphanumeric)', async () => {
      await request(app.getHttpServer())
        .post('/api/sites')
        .send({ plant_no: 'UK-123!', name: 'Valid Name' })
        .expect(400);
    });

    it('returns 400 for missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/api/sites')
        .send({ address_town: 'Oxton' })
        .expect(400);
    });

    it('returns 400 for extraneous fields', async () => {
      await request(app.getHttpServer())
        .post('/api/sites')
        .send({ plant_no: 'UK12345', name: 'Valid', evil: 'hack' })
        .expect(400);
    });
  });

  describe('GET /api/sites', () => {
    it('returns all sites ordered by name', async () => {
      await prisma.site.createMany({
        data: [
          { plant_no: 'B2', name: 'Beta Site' },
          { plant_no: 'A1', name: 'Alpha Site' },
        ],
      });

      const response = await request(app.getHttpServer())
        .get('/api/sites')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].name).toBe('Alpha Site');
      expect(response.body[1].name).toBe('Beta Site');
      // Should only contain list fields
      expect(response.body[0]).toHaveProperty('plant_no');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).not.toHaveProperty('address_town');
    });
  });

  describe('GET /api/sites/search', () => {
    beforeEach(async () => {
      await prisma.site.createMany({
        data: [
          { plant_no: 'UK11111', name: 'Alpha Abattoir' },
          { plant_no: 'UK22222', name: 'Beta Farm' },
          { plant_no: 'UK33333', name: 'Gamma Abattoir' },
        ],
      });
    });

    it('searches by exact plant_no', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/sites/search?plant_no=UK11111')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].plant_no).toBe('UK11111');
    });

    it('searches by name (contains, case-insensitive)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/sites/search?name=abattoir')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('applies AND logic for both params', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/sites/search?plant_no=UK11111&name=abattoir')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].plant_no).toBe('UK11111');
    });
  });

  describe('GET /api/sites/:plantNo', () => {
    it('returns a single site with all fields', async () => {
      await prisma.site.create({
        data: {
          plant_no: 'UK12345',
          name: 'Test Site',
          address_town: 'Oxton',
        },
      });

      const response = await request(app.getHttpServer())
        .get('/api/sites/UK12345')
        .expect(200);

      expect(response.body.plant_no).toBe('UK12345');
      expect(response.body.address_town).toBe('Oxton');
    });

    it('returns 404 for non-existent site', async () => {
      await request(app.getHttpServer())
        .get('/api/sites/MISSING')
        .expect(404);
    });
  });

  describe('PATCH /api/sites/:plantNo', () => {
    it('updates address/contact fields', async () => {
      await prisma.site.create({
        data: { plant_no: 'UK12345', name: 'Test Site' },
      });

      const response = await request(app.getHttpServer())
        .patch('/api/sites/UK12345')
        .send({ address_town: 'Oxton', telephone: '01onal' })
        .expect(200);

      expect(response.body.address_town).toBe('Oxton');
      expect(response.body.telephone).toBe('01onal');
      // Name should not change
      expect(response.body.name).toBe('Test Site');
    });

    it('returns 404 for non-existent site', async () => {
      await request(app.getHttpServer())
        .patch('/api/sites/MISSING')
        .send({ address_town: 'Oxton' })
        .expect(404);
    });
  });

  describe('PATCH /api/sites/:plantNo/name', () => {
    it('evolves a simple site name (BR-007)', async () => {
      await prisma.site.create({
        data: { plant_no: 'UK12345', name: 'Old Abattoir Co' },
      });

      const response = await request(app.getHttpServer())
        .patch('/api/sites/UK12345/name')
        .send({ new_name: 'New Meadow Farms' })
        .expect(200);

      expect(response.body.name).toBe('New Meadow Farms [Old Abattoir Co]');
    });

    it('evolves an already-evolved name, preserving only the base name', async () => {
      await prisma.site.create({
        data: { plant_no: 'UK12345', name: 'Current Name [Old Name]' },
      });

      const response = await request(app.getHttpServer())
        .patch('/api/sites/UK12345/name')
        .send({ new_name: 'Future Name' })
        .expect(200);

      expect(response.body.name).toBe('Future Name [Current Name]');
    });

    it('returns 404 for non-existent site', async () => {
      await request(app.getHttpServer())
        .patch('/api/sites/MISSING/name')
        .send({ new_name: 'New' })
        .expect(404);
    });
  });

  describe('DELETE /api/sites/:plantNo', () => {
    it('deletes an existing site and returns 204', async () => {
      await prisma.site.create({
        data: { plant_no: 'UK12345', name: 'Delete Me' },
      });

      await request(app.getHttpServer())
        .delete('/api/sites/UK12345')
        .expect(204);

      const site = await prisma.site.findUnique({
        where: { plant_no: 'UK12345' },
      });
      expect(site).toBeNull();
    });

    it('returns 404 for non-existent site', async () => {
      await request(app.getHttpServer())
        .delete('/api/sites/MISSING')
        .expect(404);
    });
  });
});
