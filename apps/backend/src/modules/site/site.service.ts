import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSiteDto } from './create-site.dto';
import { SearchSitesQueryDto } from './search-sites-query.dto';
import { UpdateSiteDto } from './update-site.dto';
import { UpdateSiteNameDto } from './update-site-name.dto';

@Injectable()
export class SiteService {
  constructor(private readonly prisma: PrismaService) {}

  async createSite(dto: CreateSiteDto) {
    try {
      return await this.prisma.site.create({ data: dto });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const target = error.meta?.target as string[] | undefined;
        if (target?.includes('plant_no')) {
          throw new ConflictException(
            'A site with this Plant Number already exists.',
          );
        }
        if (target?.includes('name')) {
          throw new ConflictException(
            'A site with this Name already exists.',
          );
        }
        throw new ConflictException('A site with this value already exists.');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.site.findMany({
      select: { plant_no: true, name: true },
      orderBy: { name: 'asc' },
    });
  }

  async findByPlantNo(plantNo: string) {
    const site = await this.prisma.site.findUnique({
      where: { plant_no: plantNo },
    });
    if (!site) {
      throw new NotFoundException(
        `Site with plant number "${plantNo}" not found.`,
      );
    }
    return site;
  }

  async searchSites(query: SearchSitesQueryDto) {
    const where: Prisma.SiteWhereInput = {};

    if (query.plant_no) {
      where.plant_no = query.plant_no;
    }
    if (query.name) {
      where.name = { contains: query.name, mode: 'insensitive' };
    }

    return this.prisma.site.findMany({
      where,
      select: { plant_no: true, name: true },
      orderBy: { name: 'asc' },
      take: 50,
    });
  }

  async updateSite(plantNo: string, dto: UpdateSiteDto) {
    await this.findByPlantNo(plantNo);
    return this.prisma.site.update({
      where: { plant_no: plantNo },
      data: dto,
    });
  }

  async updateSiteName(plantNo: string, dto: UpdateSiteNameDto) {
    const site = await this.findByPlantNo(plantNo);

    // Strip existing bracket suffix to get the base name
    const baseName = site.name.replace(/\s*\[.*\]$/, '');
    const evolvedName = `${dto.new_name} [${baseName}]`;

    if (evolvedName.length > 50) {
      throw new ConflictException(
        `Evolved name "${evolvedName}" exceeds 50 character limit.`,
      );
    }

    try {
      return await this.prisma.site.update({
        where: { plant_no: plantNo },
        data: { name: evolvedName },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'A site with this Name already exists.',
        );
      }
      throw error;
    }
  }

  async deleteSite(plantNo: string) {
    await this.findByPlantNo(plantNo);

    // TODO FT-002: Check for associated trainee records (BR-008)
    // When Trainee model is added, query for linked trainees and throw
    // ConflictException with message:
    // "There are personnel from [Site Name]. You can only delete a site with no trainees."

    return this.prisma.site.delete({
      where: { plant_no: plantNo },
    });
  }
}
