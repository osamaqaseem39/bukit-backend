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

    const authTarget = process.env.AUTH_SERVICE_URL;
    const gamingTarget = process.env.GAMING_SERVICE_URL;

    // Only proxy auth routes if AUTH_SERVICE_URL is explicitly set and not localhost
    // Otherwise, AuthModule handles routes directly
    if (
      authTarget &&
      !authTarget.includes('localhost') &&
      !authTarget.includes('127.0.0.1')
    ) {
      console.log(`Proxying auth routes to external service: ${authTarget}`);
      server.use(
        ['/auth', '/locations', '/uploads'],
        createProxyMiddleware({
          target: authTarget,
          changeOrigin: true,
          pathRewrite: {},
          timeout: 50000,
          proxyTimeout: 50000,
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
    } else {
      console.log(
        'AuthModule imported directly - auth routes handled by NestJS (no proxy)',
      );
    }

    // Only proxy gaming routes if GAMING_SERVICE_URL is explicitly set and not localhost
    if (
      gamingTarget &&
      !gamingTarget.includes('localhost') &&
      !gamingTarget.includes('127.0.0.1')
    ) {
      console.log(`Proxying gaming routes to external service: ${gamingTarget}`);
      server.use(
        ['/gaming'],
        createProxyMiddleware({
          target: gamingTarget,
          changeOrigin: true,
          pathRewrite: {},
          timeout: 50000,
          proxyTimeout: 50000,
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
    }

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
