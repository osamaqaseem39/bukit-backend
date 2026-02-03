import { NestFactory } from '@nestjs/core';
import { CricketModule } from './cricket.module';

async function bootstrap() {
  const app = await NestFactory.create(CricketModule);

  app.enableCors({
    origin: [
      process.env.CORS_ORIGIN_WEB,
      process.env.CORS_ORIGIN_ADMIN,
      process.env.CORS_ORIGIN_ADMIN_PROD,
    ].filter(Boolean),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3003);
}
bootstrap();
