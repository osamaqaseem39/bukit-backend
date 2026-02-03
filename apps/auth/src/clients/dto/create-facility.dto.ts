import { FacilityStatus, FacilityType } from '../facility.entity';

export class CreateFacilityDto {
  name: string;
  type: FacilityType;
  status?: FacilityStatus;
  capacity?: number;
  metadata?: Record<string, any>;
}

