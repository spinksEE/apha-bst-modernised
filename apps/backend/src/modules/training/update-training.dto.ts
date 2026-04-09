import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TrainingType, Species } from '@prisma/client';

export class UpdateTrainingDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  trainee_id?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  trainer_id?: number;

  @IsOptional()
  @IsDateString()
  date_trained?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one Species must be selected' })
  @IsEnum(Species, { each: true })
  species_trained?: Species[];

  @IsOptional()
  @IsEnum(TrainingType)
  training_type?: TrainingType;
}
