import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TrainingType, Species } from '@prisma/client';

export class CreateTrainingDto {
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  trainee_id!: number;

  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  trainer_id!: number;

  @IsNotEmpty()
  @IsDateString()
  date_trained!: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'At least one Species must be selected' })
  @IsEnum(Species, { each: true })
  species_trained!: Species[];

  @IsNotEmpty()
  @IsEnum(TrainingType)
  training_type!: TrainingType;
}
