import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import { UserAuthService } from 'modules/auth/services/user-auth.service';

@Injectable()
export class RequestTimingMiddleware implements NestMiddleware {
  constructor(private readonly userAuthService: UserAuthService) {}
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    res.on('finish', async () => {
      const duration = Date.now() - start;
      const accessToken = req.headers['authorization']?.split(' ')[1];
      const clientIp = req.headers['x-forwarded-for'] || req.ip; // IP клиента, даже если за прокси
      const domain = req.hostname;
      if (duration > 500) {
        let userId = null;
        let extraData = {};
        if (accessToken) {
          try {
            const tokenData = await this.userAuthService.verifyAccessToken(
              accessToken,
            );
            userId = tokenData?.user?.id;
            extraData = {
              id: tokenData?.user?.id || null,
              ip_address: req.ip || null,
              email: tokenData?.user?.email || null,
              username: tokenData.user?.username || null,
            };
          } catch (error) {
            return;
          }
        }

        Sentry.captureMessage(
          userId
            ? `Request user with id ${userId} took ${duration}ms`
            : `Request took ${duration}ms`,
          {
            level: Sentry.Severity.Info,
            extra: {
              ...extraData,
              method: req.method,
              url: req.originalUrl,
              duration,
              status: res.statusCode,
              tags: { userId, clientIp, domain },
            },
          },
        );
      }
    });

    next();
  }
}
