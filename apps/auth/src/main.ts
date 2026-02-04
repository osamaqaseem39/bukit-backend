import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

const CORS_ALLOWED_ORIGINS: string[] = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://bukit-dashboard.vercel.app',
];

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AuthModule);

  app.enableCors({
    origin: CORS_ALLOWED_ORIGINS,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Serve uploaded files statically
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
