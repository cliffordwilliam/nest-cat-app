import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

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
