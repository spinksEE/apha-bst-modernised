import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateSiteDto } from './create-site.dto';
import { SearchSitesQueryDto } from './search-sites-query.dto';
import { SiteResponseDto } from './site-response.dto';
import { UpdateSiteDto } from './update-site.dto';
import { UpdateSiteNameDto } from './update-site-name.dto';
import { SiteService } from './site.service';

@Controller('sites')
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateSiteDto): Promise<SiteResponseDto> {
    const site = await this.siteService.createSite(dto);
    return SiteResponseDto.fromEntity(site);
  }

  @Get()
  async findAll() {
    return this.siteService.findAll();
  }

  @Get('search')
  async search(@Query() query: SearchSitesQueryDto) {
    return this.siteService.searchSites(query);
  }

  @Get(':plantNo')
  async findOne(@Param('plantNo') plantNo: string): Promise<SiteResponseDto> {
    const site = await this.siteService.findByPlantNo(plantNo);
    return SiteResponseDto.fromEntity(site);
  }

  @Patch(':plantNo')
  async update(
    @Param('plantNo') plantNo: string,
    @Body() dto: UpdateSiteDto,
  ): Promise<SiteResponseDto> {
    const site = await this.siteService.updateSite(plantNo, dto);
    return SiteResponseDto.fromEntity(site);
  }

  @Patch(':plantNo/name')
  async updateName(
    @Param('plantNo') plantNo: string,
    @Body() dto: UpdateSiteNameDto,
  ): Promise<SiteResponseDto> {
    const site = await this.siteService.updateSiteName(plantNo, dto);
    return SiteResponseDto.fromEntity(site);
  }

  @Delete(':plantNo')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('plantNo') plantNo: string): Promise<void> {
    await this.siteService.deleteSite(plantNo);
  }
}
