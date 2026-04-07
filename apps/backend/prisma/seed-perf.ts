import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TOTAL_SITES = 10_000;
const BATCH_SIZE = 500;

const towns = [
  'London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow',
  'Liverpool', 'Bristol', 'Sheffield', 'Edinburgh', 'Cardiff',
  'Newcastle', 'Nottingham', 'Southampton', 'Brighton', 'Oxford',
  'Cambridge', 'York', 'Bath', 'Chester', 'Exeter',
];

const counties = [
  'Greater London', 'Greater Manchester', 'West Midlands', 'West Yorkshire',
  'Lanarkshire', 'Merseyside', 'Avon', 'South Yorkshire', 'Midlothian',
  'South Glamorgan', 'Tyne and Wear', 'Nottinghamshire', 'Hampshire',
  'East Sussex', 'Oxfordshire', 'Cambridgeshire', 'North Yorkshire',
  'Somerset', 'Cheshire', 'Devon',
];

const prefixes = [
  'Meadow', 'Valley', 'Hill', 'Oak', 'River', 'Field', 'Green',
  'Forest', 'Lake', 'Stone', 'Brook', 'Spring', 'Dale', 'Glen',
  'Elm', 'Willow', 'Ash', 'Birch', 'Cedar', 'Pine',
];

const suffixes = [
  'Farm', 'Abattoir', 'Processing', 'Meats', 'Foods', 'Poultry',
  'Livestock', 'Agriculture', 'Estate', 'Works', 'Plant', 'Holdings',
  'Trading', 'Supplies', 'Products', 'Services', 'Group', 'Co', 'Ltd', 'Enterprises',
];

function padNumber(n: number, width: number): string {
  return String(n).padStart(width, '0');
}

function generateSite(index: number) {
  const plantNo = `S${padNumber(index, 10)}`;
  const prefix = prefixes[index % prefixes.length];
  const suffix = suffixes[Math.floor(index / prefixes.length) % suffixes.length];
  const name = `${prefix} ${suffix} ${padNumber(index, 5)}`;
  const townIndex = index % towns.length;

  return {
    plant_no: plantNo,
    name: name.slice(0, 50),
    address_line_1: `${index} Industrial Way`,
    address_line_2: index % 3 === 0 ? `Unit ${index % 100}` : null,
    address_town: towns[townIndex],
    address_county: counties[townIndex],
    address_post_code: `AB${(index % 99) + 1} ${index % 10}CD`,
    telephone: `0${1200000000 + index}`,
    fax: index % 5 === 0 ? `0${1300000000 + index}` : null,
    is_apha_site: index % 10 === 0,
  };
}

async function main() {
  console.log(`Seeding ${TOTAL_SITES} site records...`);
  const start = Date.now();

  for (let batch = 0; batch < TOTAL_SITES; batch += BATCH_SIZE) {
    const sites = [];
    const end = Math.min(batch + BATCH_SIZE, TOTAL_SITES);
    for (let i = batch; i < end; i++) {
      sites.push(generateSite(i));
    }
    await prisma.site.createMany({
      data: sites,
      skipDuplicates: true,
    });
    if ((batch + BATCH_SIZE) % 2000 === 0 || end === TOTAL_SITES) {
      console.log(`  Inserted ${end} / ${TOTAL_SITES} sites`);
    }
  }

  const elapsed = Date.now() - start;
  const count = await prisma.site.count();
  console.log(`Seeding complete: ${count} total sites in ${elapsed}ms`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
