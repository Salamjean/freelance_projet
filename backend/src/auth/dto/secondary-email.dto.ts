import { IsEmail, IsNotEmpty } from 'class-validator';

export class SecondaryEmailDto {
  @IsEmail({}, { message: "Format d'adresse e-mail invalide" })
  @IsNotEmpty({ message: 'Adresse e-mail secondaire manquante' })
  secondaryEmail: string;
}
