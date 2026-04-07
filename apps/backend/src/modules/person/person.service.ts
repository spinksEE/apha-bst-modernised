import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePersonDto } from './create-person.dto';
import { UpdatePersonDto } from './update-person.dto';

@Injectable()
export class PersonService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePersonDto) {
    const site = await this.prisma.site.findUnique({
      where: { plant_no: dto.site_id },
    });
    if (!site) {
      throw new NotFoundException(
        `Site with plant number "${dto.site_id}" not found.`,
      );
    }

    const display_name = `${dto.last_name}, ${dto.first_name}`;

    return this.prisma.person.create({
      data: {
        first_name: dto.first_name,
        last_name: dto.last_name,
        display_name,
        site_id: dto.site_id,
        has_training: false,
      },
    });
  }

  async findBySite(siteId: string) {
    return this.prisma.person.findMany({
      where: { site_id: siteId },
      orderBy: { display_name: 'asc' },
    });
  }

  async findAll(siteId?: string, name?: string) {
    const where: Record<string, unknown> = {};

    if (siteId) {
      where.site_id = siteId;
    }
    if (name) {
      where.display_name = { contains: name, mode: 'insensitive' };
    }

    return this.prisma.person.findMany({
      where,
      orderBy: { display_name: 'asc' },
    });
  }

  async findById(id: number) {
    const person = await this.prisma.person.findUnique({
      where: { person_id: id },
    });
    if (!person) {
      throw new NotFoundException(`Person with ID ${id} not found.`);
    }
    return person;
  }

  async update(id: number, dto: UpdatePersonDto) {
    const person = await this.findById(id);

    if (dto.site_id) {
      const site = await this.prisma.site.findUnique({
        where: { plant_no: dto.site_id },
      });
      if (!site) {
        throw new NotFoundException(
          `Site with plant number "${dto.site_id}" not found.`,
        );
      }
    }

    const first_name = dto.first_name ?? person.first_name;
    const last_name = dto.last_name ?? person.last_name;
    const display_name = `${last_name}, ${first_name}`;

    return this.prisma.person.update({
      where: { person_id: id },
      data: {
        ...dto,
        display_name,
      },
    });
  }

  async delete(id: number) {
    const person = await this.findById(id);

    if (person.has_training) {
      throw new ConflictException(
        'Training records must be deleted before a person can be removed.',
      );
    }

    return this.prisma.person.delete({
      where: { person_id: id },
    });
  }

  async checkDuplicate(firstName: string, lastName: string, siteId: string) {
    const existing = await this.prisma.person.findMany({
      where: {
        first_name: { equals: firstName, mode: 'insensitive' },
        last_name: { equals: lastName, mode: 'insensitive' },
        site_id: siteId,
      },
    });

    return {
      isDuplicate: existing.length > 0,
      existing,
    };
  }
}
