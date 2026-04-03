import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const users = [
  {
    userName: 'supervisor',
    name: 'Supervisor User',
    role: UserRole.Supervisor,
    locationCode: 'APHA-HQ',
    password: 'Password123',
    isActive: true,
  },
  {
    userName: 'dataentry',
    name: 'Data Entry User',
    role: UserRole.DataEntry,
    locationCode: 'APHA-NE',
    password: 'Password123',
    isActive: true,
  },
  {
    userName: 'readonly',
    name: 'Read Only User',
    role: UserRole.ReadOnly,
    locationCode: 'APHA-SW',
    password: 'Password123',
    isActive: true,
  },
  {
    userName: 'sysadmin',
    name: 'System Admin',
    role: UserRole.SystemAdministrator,
    locationCode: 'APHA-HQ',
    password: 'Password123',
    isActive: true,
  },
  {
    userName: 'inactive',
    name: 'Inactive User',
    role: UserRole.DataEntry,
    locationCode: 'APHA-NE',
    password: 'Password123',
    isActive: false,
  },
];

const locations = [
  { code: 'APHA-HQ', name: 'APHA Headquarters' },
  { code: 'APHA-NE', name: 'APHA North East' },
  { code: 'APHA-SW', name: 'APHA South West' },
];

async function seed(): Promise<void> {
  for (const location of locations) {
    await prisma.aphaLocation.upsert({
      where: { code: location.code },
      update: { name: location.name, isActive: true },
      create: { code: location.code, name: location.name, isActive: true },
    });
  }

  const locationByCode = new Map(
    (await prisma.aphaLocation.findMany()).map((location) => [
      location.code,
      location,
    ]),
  );

  for (const user of users) {
    const location = locationByCode.get(user.locationCode);
    if (!location) {
      throw new Error('Missing location for ' + user.locationCode);
    }

    const passwordHash = await bcrypt.hash(user.password, 12);

    await prisma.user.upsert({
      where: { userName: user.userName },
      update: {
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        locationId: location.id,
        passwordHash,
      },
      create: {
        userName: user.userName,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        locationId: location.id,
        passwordHash,
      },
    });
  }
}

seed()
  .catch((error) => {
    console.error('Seed failed', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
