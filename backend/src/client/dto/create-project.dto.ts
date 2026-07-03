import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BudgetType, ExperienceLevel } from '@prisma/client';

export class CreateProjectDto {
  @ApiProperty({ example: 'Création d\'une application de commerce en ligne' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Nous recherchons un développeur React/Node pour finaliser notre MVP...' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  categoryId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  subCategoryId: number;

  @ApiProperty({ example: 500000 })
  @IsNumber()
  @IsNotEmpty()
  budget: number;

  @ApiProperty({ enum: BudgetType, example: 'FIXED' })
  @IsEnum(BudgetType)
  budgetType: BudgetType;

  @ApiProperty({ enum: ExperienceLevel, example: 'INTERMEDIATE' })
  @IsEnum(ExperienceLevel)
  experienceLevel: ExperienceLevel;

  @ApiProperty({ example: '1 mois', required: false })
  @IsString()
  @IsOptional()
  duration?: string;
}
