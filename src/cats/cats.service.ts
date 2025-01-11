import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Repository } from 'typeorm';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';
import { Cat } from './entities/cat.entity';
import { Trait } from './entities/trait.entity';

@Injectable()
export class CatsService {
  constructor(
    @InjectRepository(Cat)
    private readonly catRepository: Repository<Cat>,
    @InjectRepository(Trait)
    private readonly traitRepository: Repository<Trait>,
  ) {}
  async create(createCatDto: CreateCatDto) {
    const traits = await Promise.all(
      createCatDto.traits.map((name) => this.preloadTraitByName(name)),
    );
    const cat = this.catRepository.create({
      ...createCatDto,
      traits,
    });
    return this.catRepository.save(cat);
  }

  findAll(paginationQuery: PaginationQueryDto) {
    const { limit, offset } = paginationQuery;
    return this.catRepository.find({
      relations: { traits: true },
      skip: offset,
      take: limit,
    });
  }

  async findOne(id: number) {
    const cat = await this.catRepository.findOne({
      where: { id: +id },
      relations: { traits: true },
    });
    if (!cat) {
      throw new NotFoundException(`Cat #${id} not found`);
    }
    return cat;
  }

  async update(id: number, updateCatDto: UpdateCatDto) {
    const traits =
      updateCatDto.traits &&
      (await Promise.all(
        updateCatDto.traits.map((name) => this.preloadTraitByName(name)),
      ));
    const cat = await this.catRepository.preload({
      id: +id,
      ...updateCatDto,
      traits,
    });
    if (!cat) {
      throw new NotFoundException(`Cat #${id} not found`);
    }
    return this.catRepository.save(cat);
  }

  async remove(id: number) {
    const cat = await this.findOne(id);
    return this.catRepository.remove(cat);
  }

  private async preloadTraitByName(name: string): Promise<Trait> {
    const existingTrait = await this.traitRepository.findOne({
      where: { name },
    });
    if (existingTrait) {
      return existingTrait;
    }
    return this.traitRepository.create({ name });
  }
}
