import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private limiter: RateLimiterMemory;

  constructor(private readonly configService: ConfigService) {
    this.limiter = new RateLimiterMemory({
      points: configService.get(ConfigEnvEnum.RATE_LIMIT_POINTS),
      duration: 1,
    });
  }

  /**
   * Middleware function to handle rate limiting of incoming requests.
   *
   * @param {Request} req - Express.js request object.
   * @param {Response} res - Express.js response object.
   * @param {NextFunction} next - Express.js next middleware function.
   * @return {Promise<void>} - A promise that resolves when the rate limit check completes.
   */
  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.limiter.consume(req.ip);
      next();
    } catch (e) {
      res.status(HttpStatus.TOO_MANY_REQUESTS).send('Too Many Requests');
    }
  }
}
