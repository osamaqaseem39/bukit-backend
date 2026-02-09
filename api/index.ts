import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from '../apps/api/src/app.module';
import { createProxyMiddleware } from 'http-proxy-middleware';
import type { VercelRequest, VercelResponse } from '@vercel/node';

let cachedApp: NestExpressApplication;

async function bootstrap() {
  if (!cachedApp) {
    cachedApp = await NestFactory.create<NestExpressApplication>(AppModule);

    // CORS configuration
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

    cachedApp.enableCors({
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

    const server = cachedApp.getHttpAdapter().getInstance();

    const authTarget =
      process.env.AUTH_SERVICE_URL ?? 'http://localhost:3001';
    const gamingTarget =
      process.env.GAMING_SERVICE_URL ?? 'http://localhost:3002';

    // Warn if using localhost (won't work on Vercel)
    if (authTarget.includes('localhost') || authTarget.includes('127.0.0.1')) {
      console.warn(
        'WARNING: AUTH_SERVICE_URL is set to localhost. This will not work on Vercel. Please set AUTH_SERVICE_URL environment variable.',
      );
    }
    if (gamingTarget.includes('localhost') || gamingTarget.includes('127.0.0.1')) {
      console.warn(
        'WARNING: GAMING_SERVICE_URL is set to localhost. This will not work on Vercel. Please set GAMING_SERVICE_URL environment variable.',
      );
    }

    // Proxy auth-related routes to the auth service
    server.use(
      ['/auth', '/locations', '/uploads'],
      createProxyMiddleware({
        target: authTarget,
        changeOrigin: true,
        pathRewrite: {},
        timeout: 30000,
        proxyTimeout: 30000,
        onError: (err, req, res) => {
          console.error('Proxy error:', err.message);
          if (!res.headersSent) {
            res.status(502).json({
              error: 'Bad Gateway',
              message: 'Unable to connect to auth service',
              target: authTarget,
            });
          }
        },
      }),
    );

    // Proxy gaming routes to the gaming service
    server.use(
      ['/gaming'],
      createProxyMiddleware({
        target: gamingTarget,
        changeOrigin: true,
        pathRewrite: {},
        timeout: 30000,
        proxyTimeout: 30000,
        onError: (err, req, res) => {
          console.error('Proxy error:', err.message);
          if (!res.headersSent) {
            res.status(502).json({
              error: 'Bad Gateway',
              message: 'Unable to connect to gaming service',
              target: gamingTarget,
            });
          }
        },
      }),
    );

    await cachedApp.init();
  }
  return cachedApp.getHttpAdapter().getInstance();
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  try {
    const expressApp = await bootstrap();
    expressApp(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
