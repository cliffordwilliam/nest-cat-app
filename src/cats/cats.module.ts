import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { Cat } from './entities/cat.entity';
import { Trait } from './entities/trait.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cat, Trait])],
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}
