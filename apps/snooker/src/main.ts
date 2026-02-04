import { NestFactory } from '@nestjs/core';
import { SnookerModule } from './snooker.module';

async function bootstrap() {
  const app = await NestFactory.create(SnookerModule);

  await app.listen(process.env.PORT ?? 3006);
}
bootstrap();
