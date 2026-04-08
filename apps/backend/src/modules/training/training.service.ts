import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Species, TrainingType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTrainingDto } from './create-training.dto';
import { UpdateTrainingDto } from './update-training.dto';

@Injectable()
export class TrainingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTrainingDto) {
    await this.validateTrainee(dto.trainee_id);
    const trainer = await this.validateTrainer(dto.trainer_id);

    this.validateDateNotFuture(dto.date_trained);

    const sortedSpecies = this.sortSpecies(dto.species_trained);

    // BR-001: Self-training check — only if trainer is linked to a person
    if (trainer.person_id !== null && trainer.person_id === dto.trainee_id) {
      throw new BadRequestException(
        'Trainer and Trainee cannot be the same person.',
      );
    }

    // BR-005: Cascade training eligibility — trainer must hold prior certification for each species
    if (dto.training_type === TrainingType.CascadeTrained) {
      await this.validateCascadeEligibility(dto.trainer_id, sortedSpecies);
    }

    // Duplicate check: trainee + training_type + species + date (D3)
    await this.checkDuplicate(
      dto.trainee_id,
      dto.training_type,
      sortedSpecies,
      dto.date_trained,
    );

    return this.prisma.$transaction(async (tx) => {
      const training = await tx.training.create({
        data: {
          trainee_id: dto.trainee_id,
          trainer_id: dto.trainer_id,
          date_trained: new Date(dto.date_trained),
          species_trained: sortedSpecies,
          training_type: dto.training_type,
        },
        include: {
          trainee: { select: { display_name: true } },
          trainer: { select: { display_name: true } },
        },
      });

      // D5: Recompute has_training for trainee
      await this.recomputeHasTraining(tx, dto.trainee_id);

      return training;
    });
  }

  async findByTrainee(traineeId: number) {
    await this.validateTrainee(traineeId);

    return this.prisma.training.findMany({
      where: { trainee_id: traineeId, is_deleted: false },
      orderBy: { date_trained: 'desc' },
      include: {
        trainer: { select: { display_name: true } },
        trainee: { select: { display_name: true } },
      },
    });
  }

  async findById(id: number) {
    const training = await this.prisma.training.findUnique({
      where: { training_id: id },
      include: {
        trainee: { select: { display_name: true } },
        trainer: { select: { display_name: true } },
      },
    });
    if (!training) {
      throw new NotFoundException(`Training record with ID ${id} not found.`);
    }
    return training;
  }

  async update(id: number, dto: UpdateTrainingDto) {
    const existing = await this.findById(id);

    if (existing.is_deleted) {
      throw new BadRequestException(
        'Cannot update a deleted training record.',
      );
    }

    const traineeId = dto.trainee_id ?? existing.trainee_id;
    const trainerId = dto.trainer_id ?? existing.trainer_id;
    const dateTrained = dto.date_trained ?? existing.date_trained.toISOString().split('T')[0];
    const speciesTrained = dto.species_trained
      ? this.sortSpecies(dto.species_trained)
      : existing.species_trained;
    const trainingType = dto.training_type ?? existing.training_type;

    if (dto.trainee_id !== undefined) {
      await this.validateTrainee(dto.trainee_id);
    }

    let trainer = existing.trainer as { display_name: string; person_id: number | null; trainer_id: number };
    if (dto.trainer_id !== undefined) {
      trainer = await this.validateTrainer(dto.trainer_id);
    } else {
      // Load full trainer to check person_id for self-training validation
      const fullTrainer = await this.prisma.trainer.findUnique({
        where: { trainer_id: trainerId },
      });
      if (fullTrainer) {
        trainer = fullTrainer;
      }
    }

    if (dto.date_trained !== undefined) {
      this.validateDateNotFuture(dto.date_trained);
    }

    // BR-001: Self-training check
    if (
      (trainer as { person_id: number | null }).person_id !== null &&
      (trainer as { person_id: number | null }).person_id === traineeId
    ) {
      throw new BadRequestException(
        'Trainer and Trainee cannot be the same person.',
      );
    }

    // BR-005: Cascade eligibility
    if (trainingType === TrainingType.CascadeTrained) {
      await this.validateCascadeEligibility(trainerId, speciesTrained);
    }

    // Duplicate check excluding current record
    await this.checkDuplicate(
      traineeId,
      trainingType,
      speciesTrained,
      dateTrained,
      id,
    );

    const oldTraineeId = existing.trainee_id;

    const result = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.training.update({
        where: { training_id: id },
        data: {
          trainee_id: traineeId,
          trainer_id: trainerId,
          date_trained: new Date(dateTrained),
          species_trained: speciesTrained,
          training_type: trainingType,
        },
        include: {
          trainee: { select: { display_name: true } },
          trainer: { select: { display_name: true } },
        },
      });

      // D5: Recompute has_training for affected trainees
      await this.recomputeHasTraining(tx, traineeId);
      if (oldTraineeId !== traineeId) {
        await this.recomputeHasTraining(tx, oldTraineeId);
      }

      return updated;
    });

    return result;
  }

  async softDelete(id: number) {
    const existing = await this.findById(id);

    if (existing.is_deleted) {
      throw new BadRequestException(
        'Training record is already deleted.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const deleted = await tx.training.update({
        where: { training_id: id },
        data: {
          is_deleted: true,
          deleted_by: 'system',
          deleted_at: new Date(),
        },
        include: {
          trainee: { select: { display_name: true } },
          trainer: { select: { display_name: true } },
        },
      });

      // D5: Recompute has_training for trainee
      await this.recomputeHasTraining(tx, existing.trainee_id);

      return deleted;
    });
  }

  // --- Private helpers ---

  private async validateTrainee(traineeId: number) {
    const person = await this.prisma.person.findUnique({
      where: { person_id: traineeId },
    });
    if (!person) {
      throw new NotFoundException(`Person with ID ${traineeId} not found.`);
    }
    return person;
  }

  private async validateTrainer(trainerId: number) {
    const trainer = await this.prisma.trainer.findUnique({
      where: { trainer_id: trainerId },
    });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found.`);
    }
    return trainer;
  }

  private validateDateNotFuture(dateStr: string) {
    const today = new Date().toISOString().split('T')[0];
    if (dateStr > today) {
      throw new BadRequestException(
        'Training Date cannot be in the future.',
      );
    }
  }

  private sortSpecies(species: Species[]): Species[] {
    const order: Record<Species, number> = {
      [Species.Cattle]: 0,
      [Species.Sheep]: 1,
      [Species.Goat]: 2,
    };
    return [...species].sort((a, b) => order[a] - order[b]);
  }

  private async checkDuplicate(
    traineeId: number,
    trainingType: TrainingType,
    sortedSpecies: Species[],
    dateTrained: string,
    excludeId?: number,
  ) {
    const existing = await this.prisma.training.findMany({
      where: {
        trainee_id: traineeId,
        training_type: trainingType,
        date_trained: new Date(dateTrained),
        is_deleted: false,
        ...(excludeId !== undefined && {
          training_id: { not: excludeId },
        }),
      },
    });

    // Prisma doesn't support array equality in WHERE, compare in application code (D3)
    const duplicate = existing.find(
      (t) =>
        t.species_trained.length === sortedSpecies.length &&
        t.species_trained.every((s, i) => s === sortedSpecies[i]),
    );

    if (duplicate) {
      throw new ConflictException(
        'A training record for this person, training type, species, and date already exists.',
      );
    }
  }

  private async validateCascadeEligibility(
    trainerId: number,
    species: Species[],
  ) {
    // Trainer must have prior training records (as a trainee via their person_id) for each species
    const trainer = await this.prisma.trainer.findUnique({
      where: { trainer_id: trainerId },
    });

    if (!trainer || trainer.person_id === null) {
      // APHA staff trainers (no person_id) are exempt from cascade eligibility
      return;
    }

    const trainerTrainingRecords = await this.prisma.training.findMany({
      where: {
        trainee_id: trainer.person_id,
        is_deleted: false,
      },
    });

    const qualifiedSpecies = new Set<Species>();
    for (const record of trainerTrainingRecords) {
      for (const s of record.species_trained) {
        qualifiedSpecies.add(s);
      }
    }

    const unqualifiedSpecies = species.filter((s) => !qualifiedSpecies.has(s));
    if (unqualifiedSpecies.length > 0) {
      throw new BadRequestException(
        `Trainer is not qualified to deliver training for ${unqualifiedSpecies.join(', ')}.`,
      );
    }
  }

  private async recomputeHasTraining(
    tx: Parameters<Parameters<PrismaService['$transaction']>[0]>[0],
    personId: number,
  ) {
    const count = await tx.training.count({
      where: {
        trainee_id: personId,
        is_deleted: false,
      },
    });

    await tx.person.update({
      where: { person_id: personId },
      data: { has_training: count > 0 },
    });
  }
}
