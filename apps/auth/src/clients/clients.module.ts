import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { Client } from './client.entity';
import { Location } from './location.entity';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { Facility } from './facility.entity';
import { FacilitiesService } from './facilities.service';
import { FacilitiesController } from './facilities.controller';
import { LocationRequest } from './location-request.entity';
import { LocationRequestsService } from './location-requests.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Client, Location, Facility, LocationRequest]),
    forwardRef(() => UsersModule),
  ],
  controllers: [ClientsController, LocationsController, FacilitiesController],
  providers: [
    ClientsService,
    LocationsService,
    FacilitiesService,
    LocationRequestsService,
  ],
  exports: [ClientsService, LocationsService, FacilitiesService],
})
export class ClientsModule {}
