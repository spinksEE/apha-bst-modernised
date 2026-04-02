import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * Auth endpoint integration tests.
 *
 * These exercise the full HTTP request pipeline (validation, guards, controllers,
 * services, JWT issuance/verification) with PrismaService mocked out, so no
 * database is required. They complement the Playwright E2E tests which cover
 * browser-to-backend flows.
 */

const mockSupervisorUser = {
  id: 1,
  userName: 'admin.supervisor',
  userLevel: 'Supervisor',
  locationId: 1,
  location: { id: 1, locationName: 'Preston Laboratory', isAHVLA: false },
};

describe('Auth Endpoints (e2e)', () => {
  let app: INestApplication;
  let prismaService: Record<string, any>;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-jwt-secret-for-e2e';
    process.env.JWT_EXPIRY = '1h';
    process.env.ADMIN_PASSWORD = 'test-password';

    prismaService = {
      $connect: jest.fn(),
      $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
      onModuleInit: jest.fn(),
      user: {
        findUnique: jest.fn(),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({ id: 1 }),
      },
      healthCheck: {
        upsert: jest.fn(),
      },
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaService)
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------- POST /api/auth/login ----------

  describe('POST /api/auth/login', () => {
    it('returns 200 with token and user on valid credentials', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockSupervisorUser);

      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'admin.supervisor', password: 'test-password' })
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(typeof res.body.accessToken).toBe('string');
      expect(res.body.user).toMatchObject({
        userId: 1,
        userName: 'admin.supervisor',
        userLevel: 'Supervisor',
        locationName: 'Preston Laboratory',
      });

      // Verify login audit event was created
      expect(prismaService.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          eventType: 'Login',
          details: expect.stringContaining('admin.supervisor'),
          sessionId: expect.any(String),
        }),
      });
    });

    it('returns 401 when password is wrong', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'admin.supervisor', password: 'wrong-password' })
        .expect(401);

      expect(res.body.message).toBe('Invalid credentials');

      // Verify LoginFailed audit event
      expect(prismaService.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          eventType: 'LoginFailed',
          details: expect.stringContaining('admin.supervisor'),
        }),
      });
    });

    it('returns 403 when user is not found in DB', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'unknown.user', password: 'test-password' })
        .expect(403);

      expect(res.body.message).toBe('User not found in BST system');

      // Verify AccessDenied audit event
      expect(prismaService.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          eventType: 'AccessDenied',
          details: expect.stringContaining('unknown.user'),
        }),
      });
    });

    it('returns 400 when username is empty', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: '', password: 'test-password' })
        .expect(400);
    });

    it('returns 400 when password is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'admin.supervisor' })
        .expect(400);
    });

    it('returns 400 when body is empty', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({})
        .expect(400);
    });
  });

  // ---------- GET /api/auth/me ----------

  describe('GET /api/auth/me', () => {
    let validToken: string;

    beforeAll(async () => {
      prismaService.user.findUnique.mockResolvedValue(mockSupervisorUser);
      prismaService.auditLog.create.mockResolvedValue({ id: 1 });

      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'admin.supervisor', password: 'test-password' });

      validToken = res.body.accessToken;
    });

    it('returns user data with a valid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(res.body).toMatchObject({
        userId: 1,
        userName: 'admin.supervisor',
        userLevel: 'Supervisor',
        locationName: 'Preston Laboratory',
      });
    });

    it('returns 401 without a token', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/me')
        .expect(401);
    });

    it('returns 401 with an invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.jwt.token')
        .expect(401);
    });
  });

  // ---------- POST /api/auth/logout ----------

  describe('POST /api/auth/logout', () => {
    let validToken: string;

    beforeAll(async () => {
      prismaService.user.findUnique.mockResolvedValue(mockSupervisorUser);
      prismaService.auditLog.create.mockResolvedValue({ id: 1 });

      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'admin.supervisor', password: 'test-password' });

      validToken = res.body.accessToken;
    });

    it('returns 200 and logs audit event on valid logout', async () => {
      jest.clearAllMocks();

      const res = await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(res.body).toEqual({ message: 'Logged out successfully' });

      // Verify Logout audit event
      expect(prismaService.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          eventType: 'Logout',
          details: expect.stringContaining('admin.supervisor'),
          sessionId: expect.any(String),
        }),
      });
    });

    it('returns 401 without a token', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/logout')
        .expect(401);
    });
  });
});
