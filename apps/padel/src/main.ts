import { NestFactory } from '@nestjs/core';
import { PadelModule } from './padel.module';

async function bootstrap() {
  const app = await NestFactory.create(PadelModule);
  await app.listen(process.env.PORT ?? 3005);
}
bootstrap();
