import { NestFactory } from '@nestjs/core';
import { SnookerModule } from './snooker.module';

async function bootstrap() {
  const app = await NestFactory.create(SnookerModule);

  app.enableCors({
    origin: [
      process.env.CORS_ORIGIN_WEB,
      process.env.CORS_ORIGIN_ADMIN,
      process.env.CORS_ORIGIN_ADMIN_PROD,
    ].filter(Boolean),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3006);
}
bootstrap();
