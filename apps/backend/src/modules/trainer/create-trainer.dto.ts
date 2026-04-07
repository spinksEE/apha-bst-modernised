import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTrainerDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  first_name!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  last_name!: string;

  @IsNotEmpty()
  @IsString()
  location_id!: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  person_id?: number;
}
