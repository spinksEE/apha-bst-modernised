import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSiteDto {
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
