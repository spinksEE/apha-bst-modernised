import { Trainer as PrismaTrainer } from '@prisma/client';

export class TrainerResponseDto {
  trainer_id!: number;
  first_name!: string;
  last_name!: string;
  display_name!: string;
  location_id!: string;
  person_id!: number | null;

  static fromEntity(entity: PrismaTrainer): TrainerResponseDto {
    const dto = new TrainerResponseDto();
    dto.trainer_id = entity.trainer_id;
    dto.first_name = entity.first_name;
    dto.last_name = entity.last_name;
    dto.display_name = entity.display_name;
    dto.location_id = entity.location_id;
    dto.person_id = entity.person_id;
    return dto;
  }
}
