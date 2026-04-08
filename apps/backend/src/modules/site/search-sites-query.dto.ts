import { IsOptional, IsString } from 'class-validator';

export class SearchSitesQueryDto {
  @IsOptional()
  @IsString()
  plant_no?: string;

  @IsOptional()
  @IsString()
  name?: string;
}
