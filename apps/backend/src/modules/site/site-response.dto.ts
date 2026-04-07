import { Site as PrismaSite } from '@prisma/client';

type SiteWithCount = PrismaSite & { _count?: { persons: number } };

export class SiteResponseDto {
  plant_no!: string;
  name!: string;
  address_line_1!: string | null;
  address_line_2!: string | null;
  address_town!: string | null;
  address_county!: string | null;
  address_post_code!: string | null;
  telephone!: string | null;
  fax!: string | null;
  is_apha_site!: boolean;
  personnel_count?: number;

  static fromEntity(entity: SiteWithCount): SiteResponseDto {
    const dto = new SiteResponseDto();
    dto.plant_no = entity.plant_no;
    dto.name = entity.name;
    dto.address_line_1 = entity.address_line_1;
    dto.address_line_2 = entity.address_line_2;
    dto.address_town = entity.address_town;
    dto.address_county = entity.address_county;
    dto.address_post_code = entity.address_post_code;
    dto.telephone = entity.telephone;
    dto.fax = entity.fax;
    dto.is_apha_site = entity.is_apha_site;
    if (entity._count !== undefined) {
      dto.personnel_count = entity._count.persons;
    }
    return dto;
  }
}
