import { Training as PrismaTraining, Species, TrainingType } from '@prisma/client';

type TrainingWithRelations = PrismaTraining & {
  trainee?: { display_name: string };
  trainer?: { display_name: string };
};

export class TrainingResponseDto {
  training_id!: number;
  trainee_id!: number;
  trainer_id!: number;
  date_trained!: string;
  species_trained!: Species[];
  training_type!: TrainingType;
  is_deleted!: boolean;
  trainer_display_name!: string;
  trainee_display_name!: string;
  created_by!: string | null;
  created_at!: string;
  modified_by!: string | null;
  modified_at!: string;
  deleted_by!: string | null;
  deleted_at!: string | null;

  static fromEntity(entity: TrainingWithRelations): TrainingResponseDto {
    const dto = new TrainingResponseDto();
    dto.training_id = entity.training_id;
    dto.trainee_id = entity.trainee_id;
    dto.trainer_id = entity.trainer_id;
    dto.date_trained = entity.date_trained.toISOString().split('T')[0];
    dto.species_trained = entity.species_trained;
    dto.training_type = entity.training_type;
    dto.is_deleted = entity.is_deleted;
    dto.trainer_display_name = entity.trainer?.display_name ?? '';
    dto.trainee_display_name = entity.trainee?.display_name ?? '';
    dto.created_by = entity.created_by;
    dto.created_at = entity.created_at.toISOString();
    dto.modified_by = entity.modified_by;
    dto.modified_at = entity.modified_at.toISOString();
    dto.deleted_by = entity.deleted_by;
    dto.deleted_at = entity.deleted_at?.toISOString() ?? null;
    return dto;
  }
}

export class TrainingListItemDto {
  training_id!: number;
  date_trained!: string;
  training_type!: TrainingType;
  species_trained!: Species[];
  trainer_display_name!: string;

  static fromEntity(entity: TrainingWithRelations): TrainingListItemDto {
    const dto = new TrainingListItemDto();
    dto.training_id = entity.training_id;
    dto.date_trained = entity.date_trained.toISOString().split('T')[0];
    dto.training_type = entity.training_type;
    dto.species_trained = entity.species_trained;
    dto.trainer_display_name = entity.trainer?.display_name ?? '';
    return dto;
  }
}
