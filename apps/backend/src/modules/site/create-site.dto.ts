import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateSiteDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(11)
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'plant_no must contain only alphanumeric characters',
  })
  plant_no!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  address_line_1?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  address_line_2?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  address_town?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  address_county?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  address_post_code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  telephone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  fax?: string;

  @IsOptional()
  @IsBoolean()
  is_apha_site?: boolean;
}
