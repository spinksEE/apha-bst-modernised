import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateSiteNameDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  new_name!: string;
}
