import { IsEnum } from 'class-validator';

export enum PreferredEmailOption {
  PRIMARY = 'PRIMARY',
  SECONDARY = 'SECONDARY',
}

export class PreferredEmailDto {
  @IsEnum(PreferredEmailOption, {
    message: 'Type de mail principal invalide (PRIMARY ou SECONDARY)',
  })
  preferredEmailType: PreferredEmailOption;
}
