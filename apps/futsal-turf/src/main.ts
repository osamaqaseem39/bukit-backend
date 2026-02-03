import { NestFactory } from '@nestjs/core';
import { FutsalTurfModule } from './futsal-turf.module';

async function bootstrap() {
  const app = await NestFactory.create(FutsalTurfModule);
  await app.listen(process.env.PORT ?? 3004);
}
bootstrap();
