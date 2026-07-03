import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TargetRole {
  ALL = 'ALL',
  CLIENT = 'CLIENT',
  FREELANCER = 'FREELANCER',
}

export class SendMailDto {
  @ApiProperty({ description: 'Le public cible du mail', enum: TargetRole })
  @IsEnum(TargetRole)
  targetRole: TargetRole;

  @ApiProperty({ description: 'Le sujet de l\'e-mail' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ description: 'Le contenu de l\'e-mail' })
  @IsString()
  @IsNotEmpty()
  message: string;
}
