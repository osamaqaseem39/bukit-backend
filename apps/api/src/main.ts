import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { createProxyMiddleware } from 'http-proxy-middleware';

// CORS configuration similar to your example:
// - Supports explicit origins via ALLOWED_ORIGINS
// - Supports suffix-based matches via ALLOWED_ORIGIN_SUFFIXES (e.g. .vercel.app)
const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ||
  'http://localhost:3000,http://localhost:5173,https://bukit-dashboard.vercel.app'
)
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const allowedOriginSuffixes = (
  process.env.ALLOWED_ORIGIN_SUFFIXES || '.vercel.app'
)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const wildcardAllowed = allowedOrigins.includes('*');
      const exactAllowed = allowedOrigins.includes(origin);
      const suffixAllowed = allowedOriginSuffixes.some((suffix) =>
        origin.endsWith(suffix),
      );

      if (wildcardAllowed || exactAllowed || suffixAllowed) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    exposedHeaders: ['Content-Range', 'X-Total-Count'],
    maxAge: 600,
  });

  const server = app.getHttpAdapter().getInstance();

  const authTarget =
    process.env.AUTH_SERVICE_URL ?? 'http://localhost:3001';
  const gamingTarget =
    process.env.GAMING_SERVICE_URL ?? 'http://localhost:3002';

  // Proxy auth-related routes to the auth service
  server.use(
    ['/auth', '/locations', '/uploads'],
    createProxyMiddleware({
      target: authTarget,
      changeOrigin: true,
      pathRewrite: {
        // Keep paths as-is; just forward
      },
    }),
  );

  // Proxy gaming routes to the gaming service
  server.use(
    ['/gaming'],
    createProxyMiddleware({
      target: gamingTarget,
      changeOrigin: true,
      pathRewrite: {
        // Keep paths as-is; just forward
      },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
