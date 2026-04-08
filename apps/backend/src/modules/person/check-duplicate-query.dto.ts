import { IsNotEmpty, IsString } from 'class-validator';

export class CheckDuplicateQueryDto {
  @IsNotEmpty()
  @IsString()
  first_name!: string;

  @IsNotEmpty()
  @IsString()
  last_name!: string;

  @IsNotEmpty()
  @IsString()
  site_id!: string;
}
