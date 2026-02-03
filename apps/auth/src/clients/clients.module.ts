import { Module } from '@nestjs/common';
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

@Module({
  imports: [TypeOrmModule.forFeature([Client, Location, Facility])],
  controllers: [ClientsController, LocationsController, FacilitiesController],
  providers: [ClientsService, LocationsService, FacilitiesService],
  exports: [ClientsService, LocationsService, FacilitiesService],
})
export class ClientsModule {}
