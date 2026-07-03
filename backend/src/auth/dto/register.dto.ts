import { IsEmail, IsString, IsEnum, MinLength, IsNotEmpty } from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Format d\'adresse e-mail invalide' })
  email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6, { message: 'Le mot de passe doit faire au moins 6 caractères' })
  password!: string;

  @ApiProperty({ enum: Role, example: Role.CLIENT })
  @IsEnum(Role, { message: 'Rôle invalide' })
  role!: Role;

  @ApiProperty({ example: 'Jean' })
  @IsString()
  @IsNotEmpty({ message: 'Le prénom est requis' })
  firstName!: string;

  @ApiProperty({ example: 'Dupont' })
  @IsString()
  @IsNotEmpty({ message: 'Le nom est requis' })
  lastName!: string;
}
