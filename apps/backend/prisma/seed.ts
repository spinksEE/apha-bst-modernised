import { PrismaClient, UserLevel } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  // Seed APHA Locations
  const preston = await prisma.aPHALocation.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, locationName: 'Preston Laboratory', isAHVLA: false },
  });

  const weybridge = await prisma.aPHALocation.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, locationName: 'Weybridge', isAHVLA: true },
  });

  const carmarthen = await prisma.aPHALocation.upsert({
    where: { id: 3 },
    update: {},
    create: { id: 3, locationName: 'Carmarthen', isAHVLA: false },
  });

  console.log('Seeded locations:', { preston, weybridge, carmarthen });

  // Seed Users — one per role
  const supervisor = await prisma.user.upsert({
    where: { userName: 'admin.supervisor' },
    update: {},
    create: {
      userName: 'admin.supervisor',
      locationId: weybridge.id,
      userLevel: UserLevel.Supervisor,
    },
  });

  const dataEntry = await prisma.user.upsert({
    where: { userName: 'data.entry' },
    update: {},
    create: {
      userName: 'data.entry',
      locationId: preston.id,
      userLevel: UserLevel.DataEntry,
    },
  });

  const readOnly = await prisma.user.upsert({
    where: { userName: 'read.only' },
    update: {},
    create: {
      userName: 'read.only',
      locationId: carmarthen.id,
      userLevel: UserLevel.ReadOnly,
    },
  });

  console.log('Seeded users:', { supervisor, dataEntry, readOnly });

  // Seed DataEntryPermissions for the Data Entry user
  const screens = [
    { screenName: 'training-records', canWrite: true },
    { screenName: 'site-management', canWrite: true },
    { screenName: 'personnel-management', canWrite: true },
    { screenName: 'reports', canWrite: false },
  ];

  for (const screen of screens) {
    await prisma.dataEntryPermission.upsert({
      where: {
        screenName_userId: {
          screenName: screen.screenName,
          userId: dataEntry.id,
        },
      },
      update: { canWrite: screen.canWrite },
      create: {
        screenName: screen.screenName,
        userId: dataEntry.id,
        canWrite: screen.canWrite,
      },
    });
  }

  console.log('Seeded data entry permissions for user:', dataEntry.userName);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seed error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
