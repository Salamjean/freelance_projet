import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: "Format d'adresse e-mail invalide" })
  @IsNotEmpty({ message: 'Adresse e-mail manquante' })
  email: string;
}
