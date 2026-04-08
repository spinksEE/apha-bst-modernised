import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePersonDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  first_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  last_name?: string;

  @IsOptional()
  @IsString()
  site_id?: string;
}
