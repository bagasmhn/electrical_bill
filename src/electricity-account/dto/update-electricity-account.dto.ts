import { PartialType } from '@nestjs/mapped-types';
import { CreateElectricityAccountDto } from './create-electricity-account.dto';

export class UpdateElectricityAccountDto extends PartialType(
  CreateElectricityAccountDto,
) {}
