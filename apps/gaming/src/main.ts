import { NestFactory } from '@nestjs/core';
import { GamingModule } from './gaming.module';

async function bootstrap() {
  const app = await NestFactory.create(GamingModule);

  app.enableCors({
    origin: [
      process.env.CORS_ORIGIN_WEB,
      process.env.CORS_ORIGIN_ADMIN,
      process.env.CORS_ORIGIN_ADMIN_PROD,
    ].filter(Boolean),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(process.env.port ?? 3000);
}
bootstrap();
