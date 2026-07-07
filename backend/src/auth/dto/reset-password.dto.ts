import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

export class ResetPasswordDto {
  @IsEmail({}, { message: "Format d'adresse e-mail invalide" })
  @IsNotEmpty({ message: 'Adresse e-mail manquante' })
  email: string;

  @IsString()
  @Length(6, 6, { message: 'Le code OTP doit contenir 6 chiffres' })
  @IsNotEmpty({ message: 'Code OTP manquant' })
  otp: string;

  @IsString()
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères',
  })
  @IsNotEmpty({ message: 'Nouveau mot de passe manquant' })
  newPassword: string;
}
