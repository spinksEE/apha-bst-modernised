import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateTrainingDto } from './create-training.dto';
import { UpdateTrainingDto } from './update-training.dto';
import {
  TrainingResponseDto,
  TrainingListItemDto,
} from './training-response.dto';
import { TrainingService } from './training.service';

@Controller('trainings')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateTrainingDto): Promise<TrainingResponseDto> {
    const training = await this.trainingService.create(dto);
    return TrainingResponseDto.fromEntity(training);
  }

  // Static route must come before parameterised :id route
  @Get('by-trainee')
  async findByTrainee(
    @Query('trainee_id', ParseIntPipe) traineeId: number,
  ): Promise<TrainingListItemDto[]> {
    const trainings = await this.trainingService.findByTrainee(traineeId);
    return trainings.map(TrainingListItemDto.fromEntity);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TrainingResponseDto> {
    const training = await this.trainingService.findById(id);
    return TrainingResponseDto.fromEntity(training);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTrainingDto,
  ): Promise<TrainingResponseDto> {
    const training = await this.trainingService.update(id, dto);
    return TrainingResponseDto.fromEntity(training);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async softDelete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.trainingService.softDelete(id);
  }
}
