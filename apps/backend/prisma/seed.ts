import { PrismaClient, TrainingType, Species } from '@prisma/client';

const prisma = new PrismaClient();

const devSites = [
  {
    plant_no: 'AB12345678',
    name: 'Greenfield Farm',
    address_line_1: '12 Station Road',
    address_line_2: null,
    address_town: 'Hereford',
    address_county: 'Herefordshire',
    address_post_code: 'HR1 2AB',
    telephone: '01432 123456',
    fax: null,
    is_apha_site: false,
  },
  {
    plant_no: 'CD23456789',
    name: 'Northern Meats Co [Old Abattoir Co]',
    address_line_1: '5 Industrial Estate',
    address_line_2: 'Unit 3',
    address_town: 'Leeds',
    address_county: 'West Yorkshire',
    address_post_code: 'LS1 4AP',
    telephone: '0113 987 6543',
    fax: '0113 987 6544',
    is_apha_site: false,
  },
  {
    plant_no: 'EF34567890',
    name: 'APHA Regional Lab Weybridge',
    address_line_1: 'Woodham Lane',
    address_line_2: 'Addlestone',
    address_town: 'Weybridge',
    address_county: 'Surrey',
    address_post_code: 'KT15 3NB',
    telephone: '01932 341111',
    fax: '01932 347046',
    is_apha_site: true,
  },
  {
    plant_no: 'GH4567890A',
    name: 'Valley Processing Ltd',
    address_line_1: '88 River Lane',
    address_line_2: null,
    address_town: 'Taunton',
    address_county: 'Somerset',
    address_post_code: 'TA1 3EP',
    telephone: '01823 456789',
    fax: null,
    is_apha_site: false,
  },
  {
    plant_no: 'IJ56789012',
    name: 'Highland Livestock Services',
    address_line_1: '2 Glen Road',
    address_line_2: null,
    address_town: 'Inverness',
    address_county: 'Highland',
    address_post_code: 'IV1 1QA',
    telephone: '01463 234567',
    fax: null,
    is_apha_site: false,
  },
  {
    plant_no: 'KL67890123',
    name: 'Oakwood Poultry Farm',
    address_line_1: '14 Church Street',
    address_line_2: 'Oakwood Village',
    address_town: 'Norwich',
    address_county: 'Norfolk',
    address_post_code: 'NR1 3DD',
    telephone: '01603 678901',
    fax: null,
    is_apha_site: false,
  },
  {
    plant_no: 'MN78901234',
    name: 'Bristol Meats Group',
    address_line_1: '40 Harbour Road',
    address_line_2: 'Avonmouth',
    address_town: 'Bristol',
    address_county: 'Avon',
    address_post_code: 'BS11 9AG',
    telephone: '0117 234 5678',
    fax: '0117 234 5679',
    is_apha_site: false,
  },
  {
    plant_no: 'OP89012345',
    name: 'Welsh Dragon Abattoir',
    address_line_1: '7 Market Square',
    address_line_2: null,
    address_town: 'Carmarthen',
    address_county: 'Carmarthenshire',
    address_post_code: 'SA31 1QY',
    telephone: '01267 890123',
    fax: null,
    is_apha_site: false,
  },
  {
    plant_no: 'QR90123456',
    name: 'Pennine Agriculture',
    // Minimal site — only required fields
    address_line_1: null,
    address_line_2: null,
    address_town: null,
    address_county: null,
    address_post_code: null,
    telephone: null,
    fax: null,
    is_apha_site: false,
  },
  {
    plant_no: 'ST01234567',
    name: 'APHA Penrith Lab',
    address_line_1: 'Merrythought',
    address_line_2: 'Calthwaite',
    address_town: 'Penrith',
    address_county: 'Cumbria',
    address_post_code: 'CA11 9RR',
    telephone: '01768 885500',
    fax: '01768 885501',
    is_apha_site: true,
  },
];

const devPersons = [
  {
    first_name: 'James',
    last_name: 'Wilson',
    site_id: 'AB12345678', // Greenfield Farm
    has_training: false,
  },
  {
    first_name: 'Sarah',
    last_name: 'Thompson',
    site_id: 'AB12345678', // Greenfield Farm
    has_training: false,
  },
  {
    first_name: 'Robert',
    last_name: 'Davies',
    site_id: 'AB12345678', // Greenfield Farm
    has_training: false,
  },
  {
    first_name: 'Emily',
    last_name: 'Clark',
    site_id: 'AB12345678', // Greenfield Farm
    has_training: false,
  },
  {
    first_name: 'Michael',
    last_name: 'Hughes',
    site_id: 'CD23456789', // Northern Meats Co
    has_training: false,
  },
  {
    first_name: 'Laura',
    last_name: 'Bennett',
    site_id: 'CD23456789', // Northern Meats Co
    has_training: false,
  },
  {
    first_name: 'David',
    last_name: 'Patel',
    site_id: 'CD23456789', // Northern Meats Co
    has_training: false,
  },
];

const devTrainers = [
  {
    first_name: 'Catherine',
    last_name: 'Reed',
    location_id: 'EF34567890', // APHA Regional Lab Weybridge
    person_id: null, // APHA staff trainer
  },
  {
    first_name: 'James',
    last_name: 'Wilson',
    location_id: 'AB12345678', // Greenfield Farm — cascade trainer linked to person
    person_id: 1, // Will be linked to seeded person_id 1
  },
];

async function main() {
  console.log(`Seeding ${devSites.length} dev sites...`);

  for (const site of devSites) {
    await prisma.site.upsert({
      where: { plant_no: site.plant_no },
      update: {
        name: site.name,
        address_line_1: site.address_line_1,
        address_line_2: site.address_line_2,
        address_town: site.address_town,
        address_county: site.address_county,
        address_post_code: site.address_post_code,
        telephone: site.telephone,
        fax: site.fax,
        is_apha_site: site.is_apha_site,
      },
      create: site,
    });
  }

  const siteCount = await prisma.site.count();
  console.log(`Seeded ${siteCount} sites`);

  console.log(`Seeding ${devPersons.length} dev persons...`);

  const seededPersonIds: number[] = [];
  for (const person of devPersons) {
    const display_name = `${person.last_name}, ${person.first_name}`;
    const existing = await prisma.person.findFirst({
      where: {
        first_name: person.first_name,
        last_name: person.last_name,
        site_id: person.site_id,
      },
    });
    if (existing) {
      await prisma.person.update({
        where: { person_id: existing.person_id },
        data: { display_name, has_training: person.has_training },
      });
      seededPersonIds.push(existing.person_id);
    } else {
      const created = await prisma.person.create({
        data: {
          first_name: person.first_name,
          last_name: person.last_name,
          display_name,
          site_id: person.site_id,
          has_training: person.has_training,
        },
      });
      seededPersonIds.push(created.person_id);
    }
  }

  const personCount = await prisma.person.count();
  console.log(`Seeded ${personCount} persons`);

  console.log(`Seeding ${devTrainers.length} dev trainers...`);

  for (const trainer of devTrainers) {
    const display_name = `${trainer.last_name}, ${trainer.first_name}`;
    // Resolve person_id: if trainer references person index 1, use the actual seeded person_id
    const resolvedPersonId =
      trainer.person_id !== null ? seededPersonIds[trainer.person_id - 1] : null;

    const existing = await prisma.trainer.findFirst({
      where: {
        first_name: trainer.first_name,
        last_name: trainer.last_name,
        location_id: trainer.location_id,
      },
    });
    if (existing) {
      await prisma.trainer.update({
        where: { trainer_id: existing.trainer_id },
        data: { display_name, person_id: resolvedPersonId },
      });
    } else {
      await prisma.trainer.create({
        data: {
          first_name: trainer.first_name,
          last_name: trainer.last_name,
          display_name,
          location_id: trainer.location_id,
          person_id: resolvedPersonId,
        },
      });
    }
  }

  const seededTrainerIds: number[] = [];
  const allTrainers = await prisma.trainer.findMany({
    orderBy: { trainer_id: 'asc' },
  });
  for (const trainer of devTrainers) {
    const found = allTrainers.find(
      (t) =>
        t.first_name === trainer.first_name &&
        t.last_name === trainer.last_name &&
        t.location_id === trainer.location_id,
    );
    if (found) {
      seededTrainerIds.push(found.trainer_id);
    }
  }

  const trainerCount = await prisma.trainer.count();
  console.log(`Seeded ${trainerCount} trainers`);

  // --- Training seed records ---
  // person index: 0=James Wilson, 1=Sarah Thompson, 2=Robert Davies,
  //               3=Emily Clark, 4=Michael Hughes, 5=Laura Bennett, 6=David Patel
  // trainer index: 0=Catherine Reed (APHA staff), 1=James Wilson (cascade)
  const devTrainings = [
    {
      traineeIndex: 0, // James Wilson
      trainerIndex: 0, // Catherine Reed (APHA staff)
      date_trained: '2025-06-15',
      species_trained: [Species.Cattle],
      training_type: TrainingType.Trained,
    },
    {
      traineeIndex: 0, // James Wilson
      trainerIndex: 0, // Catherine Reed (APHA staff)
      date_trained: '2025-09-20',
      species_trained: [Species.Goat, Species.Sheep],
      training_type: TrainingType.CascadeTrained,
    },
    {
      traineeIndex: 3, // Emily Clark
      trainerIndex: 0, // Catherine Reed (APHA staff)
      date_trained: '2025-11-10',
      species_trained: [Species.Cattle],
      training_type: TrainingType.TrainingConfirmed,
    },
    {
      traineeIndex: 5, // Laura Bennett
      trainerIndex: 0, // Catherine Reed (APHA staff)
      date_trained: '2026-01-08',
      species_trained: [Species.Sheep],
      training_type: TrainingType.Trained,
    },
  ];

  console.log(`Seeding ${devTrainings.length} dev training records...`);

  for (const training of devTrainings) {
    const traineeId = seededPersonIds[training.traineeIndex];
    const trainerId = seededTrainerIds[training.trainerIndex];
    const sortedSpecies = [...training.species_trained].sort();

    const existing = await prisma.training.findFirst({
      where: {
        trainee_id: traineeId,
        trainer_id: trainerId,
        training_type: training.training_type,
        date_trained: new Date(training.date_trained),
        is_deleted: false,
      },
    });

    if (!existing) {
      await prisma.training.create({
        data: {
          trainee_id: traineeId,
          trainer_id: trainerId,
          date_trained: new Date(training.date_trained),
          species_trained: sortedSpecies,
          training_type: training.training_type,
        },
      });
    }
  }

  const trainingCount = await prisma.training.count();
  console.log(`Seeded ${trainingCount} training records`);

  // Recompute has_training for ALL persons based on actual training records
  console.log('Recomputing has_training flags...');
  const allPersons = await prisma.person.findMany({ select: { person_id: true } });
  for (const person of allPersons) {
    const hasTraining = await prisma.training.findFirst({
      where: { trainee_id: person.person_id, is_deleted: false },
    });
    await prisma.person.update({
      where: { person_id: person.person_id },
      data: { has_training: hasTraining !== null },
    });
  }
  console.log('has_training flags recomputed');

  console.log('Seeding complete');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
