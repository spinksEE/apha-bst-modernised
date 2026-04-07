import { PrismaClient } from '@prisma/client';

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

  const count = await prisma.site.count();
  console.log(`Seeding complete: ${count} total sites in database`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
