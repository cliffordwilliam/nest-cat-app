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

  @JoinTable()
  @ManyToMany((type) => Trait, (trait) => trait.cats, { cascade: true })
  traits: Trait[];
}
