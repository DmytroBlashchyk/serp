import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
const os = require('os');
@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  /**
   * Intercepts the execution context and call handler to measure performance metrics.
   *
   * @param {ExecutionContext} context - The context of the current execution.
   * @param {CallHandler} next - The next call handler in the pipeline.
   * @return {Observable<any>} An observable that can be used to complete the request-response cycle.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const methodName = context.getHandler().name;
    const initialMemoryUsage = process.memoryUsage().heapUsed;
    const initialCpuUsage = process.cpuUsage();
    const initialTime = process.hrtime();

    return next.handle().pipe(
      tap(() => {
        const finalMemoryUsage = process.memoryUsage().heapUsed;
        const finalCpuUsage = process.cpuUsage(initialCpuUsage);
        const finalTime = process.hrtime(initialTime);

        const memoryUsed = finalMemoryUsage - initialMemoryUsage;
        const cpuUsed = (finalCpuUsage.user + finalCpuUsage.system) / 1000; // Convert to milliseconds

        // Calculate the elapsed time in milliseconds
        const elapsedTime = finalTime[0] * 1000 + finalTime[1] / 1e6;

        // Get the number of CPU cores
        const cpuCores = os.cpus().length;

        // Calculate CPU usage percentage
        const cpuUsagePercent = (cpuUsed / (elapsedTime * cpuCores)) * 100;
      }),
    );
  }
}
