import { PartialType } from '@nestjs/mapped-types';
import { CreateElectricityServiceDto } from './create-electricity-service.dto';

export class UpdateElectricityServiceDto extends PartialType(CreateElectricityServiceDto) {}
