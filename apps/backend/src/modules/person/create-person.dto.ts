import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePersonDto {
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
  site_id!: string;
}
