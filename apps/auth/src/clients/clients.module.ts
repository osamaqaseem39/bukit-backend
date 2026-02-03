import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { Client } from './client.entity';
import { Location } from './location.entity';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Client, Location])],
  controllers: [ClientsController, LocationsController],
  providers: [ClientsService, LocationsService],
  exports: [ClientsService, LocationsService],
})
export class ClientsModule {}
