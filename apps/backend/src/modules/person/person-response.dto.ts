import { Person as PrismaPerson } from '@prisma/client';

export class PersonResponseDto {
  person_id!: number;
  first_name!: string;
  last_name!: string;
  display_name!: string;
  site_id!: string;
  has_training!: boolean;

  static fromEntity(entity: PrismaPerson): PersonResponseDto {
    const dto = new PersonResponseDto();
    dto.person_id = entity.person_id;
    dto.first_name = entity.first_name;
    dto.last_name = entity.last_name;
    dto.display_name = entity.display_name;
    dto.site_id = entity.site_id;
    dto.has_training = entity.has_training;
    return dto;
  }
}
