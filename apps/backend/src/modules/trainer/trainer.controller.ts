import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CreateTrainerDto } from './create-trainer.dto';
import { TrainerResponseDto } from './trainer-response.dto';
import { TrainerService } from './trainer.service';

@Controller('trainers')
export class TrainerController {
  constructor(private readonly trainerService: TrainerService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateTrainerDto): Promise<TrainerResponseDto> {
    const trainer = await this.trainerService.create(dto);
    return TrainerResponseDto.fromEntity(trainer);
  }

  @Get()
  async findAll() {
    const trainers = await this.trainerService.findAll();
    return trainers.map(TrainerResponseDto.fromEntity);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TrainerResponseDto> {
    const trainer = await this.trainerService.findById(id);
    return TrainerResponseDto.fromEntity(trainer);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.trainerService.delete(id);
  }
}
