import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTrainerDto } from './create-trainer.dto';

@Injectable()
export class TrainerService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTrainerDto) {
    const site = await this.prisma.site.findUnique({
      where: { plant_no: dto.location_id },
    });
    if (!site) {
      throw new NotFoundException(
        `Site with plant number "${dto.location_id}" not found.`,
      );
    }

    if (dto.person_id !== undefined) {
      const person = await this.prisma.person.findUnique({
        where: { person_id: dto.person_id },
      });
      if (!person) {
        throw new NotFoundException(
          `Person with ID ${dto.person_id} not found.`,
        );
      }
    }

    const display_name = `${dto.last_name}, ${dto.first_name}`;

    return this.prisma.trainer.create({
      data: {
        first_name: dto.first_name,
        last_name: dto.last_name,
        display_name,
        location_id: dto.location_id,
        person_id: dto.person_id ?? null,
      },
    });
  }

  async findAll() {
    return this.prisma.trainer.findMany({
      orderBy: { display_name: 'asc' },
    });
  }

  async findById(id: number) {
    const trainer = await this.prisma.trainer.findUnique({
      where: { trainer_id: id },
    });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${id} not found.`);
    }
    return trainer;
  }

  async delete(id: number) {
    await this.findById(id);
    return this.prisma.trainer.delete({
      where: { trainer_id: id },
    });
  }
}
