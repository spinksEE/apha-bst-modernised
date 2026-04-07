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
import { CreatePersonDto } from './create-person.dto';
import { UpdatePersonDto } from './update-person.dto';
import { CheckDuplicateQueryDto } from './check-duplicate-query.dto';
import { PersonResponseDto } from './person-response.dto';
import { PersonService } from './person.service';

@Controller('persons')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreatePersonDto): Promise<PersonResponseDto> {
    const person = await this.personService.create(dto);
    return PersonResponseDto.fromEntity(person);
  }

  @Get()
  async findAll(
    @Query('site_id') siteId?: string,
    @Query('name') name?: string,
  ) {
    const persons = await this.personService.findAll(siteId, name);
    return persons.map(PersonResponseDto.fromEntity);
  }

  @Get('check-duplicate')
  async checkDuplicate(@Query() query: CheckDuplicateQueryDto) {
    return this.personService.checkDuplicate(
      query.first_name,
      query.last_name,
      query.site_id,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PersonResponseDto> {
    const person = await this.personService.findById(id);
    return PersonResponseDto.fromEntity(person);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePersonDto,
  ): Promise<PersonResponseDto> {
    const person = await this.personService.update(id, dto);
    return PersonResponseDto.fromEntity(person);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.personService.delete(id);
  }
}
