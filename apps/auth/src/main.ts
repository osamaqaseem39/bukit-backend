import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

const CORS_EXACT_ALLOWED_ORIGINS: string[] = [
  'http://localhost:3000',
  'http://localhost:5173',
];

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true;

  if (CORS_EXACT_ALLOWED_ORIGINS.includes(origin)) return true;

  if (origin.startsWith('https://bukit-dashboard')) return true;

  return false;
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AuthModule);

  app.enableCors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin as string | undefined)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'), false);
      }
    },
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
