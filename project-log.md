```bash
# install node with odin guide
# update node lts
$ nvm install --lts
$ nvm use --lts
$ node -v
```

```bash
# install / update NestJS CLI -globally
$ npm i -g @nestjs/cli
$ nest new project-name
```

```
create new github remote repo
set name
set desc
```

```bash
# first commit and push to remote
$ git add .
$ git commit -m "first commit"
$ git remote add origin git@github.com:cliffordwilliam/nest-cat-app.git
```

```
remove test & initial hello world controller and service
```

```bash
# run before commit, too lazy to use precommit stuff
# lint and autofix with eslint
$ npm run lint
# format with prettier
$ npm run format
```

```bash
# create cats resource
nest g res --no-spec
```

```bash
# get dep for global pipe dto validator, throws on invalids
npm i class-validator class-transformer
```

```javascript
// bind in entry, this thing does not need injection
app.useGlobalPipes(
  new ValidationPipe({
    forbidNonWhitelisted: true,
    transform: true,
    whitelist: true,
  }),
);
```

```javascript
// set validation rules on cats dto
import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator';

export class CreateCatDto {
  @IsString()
  name: string;

  @IsString()
  breed: string;

  @IsInt()
  @Min(0)
  @Max(20)
  age: number;

  @IsOptional()
  @IsString()
  color?: string;
}
```

```bash
# get dep for auto create update dto
npm i @nestjs/mapped-types
```

```javascript
// do this for update dto
import { PartialType } from '@nestjs/mapped-types';
import { CreateCatDto } from './create-cat.dto';

export class UpdateCatDto extends PartialType(CreateCatDto) {}
```

```bash
# install local postgresql with odin guide
# use local postgresql with odin guide
# create db
# get connection data

# enter postgresql shell
psql

# create db for this nest app
CREATE DATABASE dsadsa_dsadsa_dsadsa;

# connect to it
\c dsadsa_dsadsa_dsadsa

# exit shell
\q
```

```bash
# get typeorm deps
npm i @nestjs/typeorm typeorm pg
```

```javascript
// example connection data
const { Pool } = require('pg');

// All of the following properties should be read from environment variables
// We're hardcoding them here for simplicity
module.exports = new Pool({
  host: 'localhost', // or wherever the db is hosted
  user: '<role_name>', // machine username whoami
  database: 'top_users',
  password: '<role_password>', // machine pass
  port: 5432, // The default port
});
```

```
install dbeaver
open dbeaver
connect with the above connection data
```

```javascript
// init 3rd party module typeorm
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sdadsa',
      host: 'sdadsa',
      port: 5432,
      username: 'asddsa',
      password: 'asddsa',
      database: 'dsadsa',
      autoLoadEntities: true,
      synchronize: true, // turn off in prod - on app build, entities are used to make db table
    }),
    CatsModule,
  ],
})
export class AppModule {}
```

```
run watch mode
see if typeorm dep is initialized = that means connection to local db is ok
```

```javascript
// work on cat entity
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Cat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  breed: string;

  @Column()
  age: number;

  @Column({ nullable: true })
  color?: string;
}
```

```javascript
// register entity to parent module
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { Cat } from './entities/cat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cat])],
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}
```

```
see the new table in dbeaver
new table is made when u rebuilt app, it makes table based on entity
```

```javascript
// inject cats repo and use it in serv

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';
import { Cat } from './entities/cat.entity';

@Injectable()
export class CatsService {
  constructor(
    @InjectRepository(Cat)
    private readonly catRepository: Repository<Cat>,
  ) {}
  create(createCatDto: CreateCatDto) {
    const cat = this.catRepository.create(createCatDto);
    return this.catRepository.save(cat);
  }

  findAll() {
    return this.catRepository.find();
  }

  async findOne(id: number) {
    const cat = await this.catRepository.findOne({ where: { id: +id } });
    if (!cat) {
      throw new NotFoundException(`Cat #${id} not found`);
    }
    return cat;
  }

  async update(id: number, updateCatDto: UpdateCatDto) {
    const cat = await this.catRepository.preload({
      id: +id,
      ...updateCatDto,
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
}
```

```bash
# create new entity def traits, cats personality traits
$ nest g class cats/entities/trait.entity --no-spec --flat
```

```javascript
// edit the inside, class name = table name
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Trait {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
```

```javascript
// create many to many def in both entity

import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Cat } from './cat.entity';

@Entity()
export class Trait {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany((type) => Cat, (cat) => cat.traits)
  cats: Cat[];
}

// ---

import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Trait } from './trait.entity';

@Entity()
export class Cat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  breed: string;

  @Column()
  age: number;

  @Column({ nullable: true })
  color?: string;

  @JoinTable() // owner
  @ManyToMany((type) => Trait, (trait) => trait.cats)
  traits: Trait[];
}
```

```javascript
// register entity to parent module

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
```

```
save and run, this rebuilds the app
now entity should be used to make new db table
use dbeaver to see new table update
```

```javascript
// include relation in owner cat find handler

  findAll() {
    return this.catRepository.find({ relations: { traits: true } });
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
```

```
test with client, when u get all, there should be a prop to hold relation
```

```javascript
// update cat dto, since now it needs traits when u make 1 cat
import { IsArray, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateCatDto {
  @IsString()
  readonly name: string;

  @IsString()
  readonly breed: string;

  @IsInt()
  @Min(0)
  @Max(20)
  readonly age: number;

  @IsOptional()
  @IsString()
  readonly color?: string;

  @IsArray()
  @IsString({ each: true })
  traits: string[];
}

```

```javascript
// set cascade true in many to many owner
  @ManyToMany((type) => Trait, (trait) => trait.cats, { cascade: true })
```

```javascript
// create a find or make trait method
  private async preloadTraitByName(name: string): Promise<Trait> {
    const existingTrait = await this.traitRepository.findOne({
      where: { name },
    });
    if (existingTrait) {
      return existingTrait;
    }
    return this.traitRepository.create({ name });
  }
```

```javascript
// use it in create and update
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
```

```
test with client

post
localhost:3000/cats
{
  "name": "Fluffy",
  "breed": "Persian",
  "age": 2,
  "traits": ["Playful", "Curious"]
}
```

```bash
# make pagination dto for all to use
nest g class common/dto/pagination-query.dto --no-spec --flat
```

```javascript
// work on the pagination dto
export class PaginationQueryDto {
  @Type(() => Number)
  @IsOptional()
  @IsPositive()
  limit: number;

  @Type(() => Number)
  @IsOptional()
  @IsPositive()
  offset: number;
}
```

```javascript
// use it in controller and service
  @Get()
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.catsService.findAll(paginationQuery);
  }

  findAll(paginationQuery: PaginationQueryDto) {
    const { limit, offset } = paginationQuery;
    return this.catRepository.find({
      relations: { traits: true },
      skip: limit,
      take: offset,
    });
  }
```

```
test pagination

/cats?limit=2&offset=0

/cats?limit=2&offset=2
```

```bash
# install dep for config module
npm i @nestjs/config
```

```javascript
// init 3rd party module in root module
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatsModule } from './cats/cats.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(), // this will read .env, u can use process / config service to get data now
    TypeOrmModule.forRoot({
      type: 'dsadsadsa',
      host: 'dsadsadsa',
      port: 321321321,
      username: 'dsadsa',
      password: 'dsadsa',
      database: 'dsadsa',
      autoLoadEntities: true,
      synchronize: true,
    }),
    CatsModule,
  ],
})
export class AppModule {}
```

```
create env file in root, dump all of it in there

DATABASE_USER=dsa
DATABASE_PASSWORD=dsa
DATABASE_NAME=dsa
DATABASE_PORT=dsa
DATABASE_HOST=dsa

also add this at end of gitignore to ensure this thing is ignored
# Env
*.env
```

```javascript
// replace the hard code with process.env
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatsModule } from './cats/cats.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(), // this will read .env, u can use process / config service to get data now
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: +process.env.DATABASE_PORT,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    CatsModule,
  ],
})
export class AppModule {}
```

```
rerun app

check if connection is okay, if typeorm dep is init
```

todo

1. make this like an e commerce to buy cats or something
2. do safety stuff later, no auth no nothing, just main e commerce feature first
3. work with front-end, use next js for now + material ui
