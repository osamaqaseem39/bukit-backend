import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../../auth/src/auth.module';
import { GamingModule } from '../../gaming/src/gaming.module';
import { CricketModule } from '../../cricket/src/cricket.module';
import { PadelModule } from '../../padel/src/padel.module';
import { SnookerModule } from '../../snooker/src/snooker.module';
import { TableTennisModule } from '../../table-tennis/src/table-tennis.module';
import { FutsalTurfModule } from '../../futsal-turf/src/futsal-turf.module';

@Module({
  imports: [
    AuthModule,
    GamingModule,
    CricketModule,
    PadelModule,
    SnookerModule,
    TableTennisModule,
    FutsalTurfModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
