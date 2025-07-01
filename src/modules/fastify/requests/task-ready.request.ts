import { IsArray, IsNumber, IsString } from 'class-validator';
import { TaskRequest } from 'modules/fastify/requests/task.request';

export class TaskReadyRequest {
  @IsString()
  version: string;

  @IsNumber()
  status_code: number;

  @IsString()
  status_message: string;

  @IsString()
  time: string;

  @IsNumber()
  cost: number;

  @IsNumber()
  tasks_count: number;

  @IsNumber()
  tasks_error: number;

  @IsArray({ context: TaskRequest })
  tasks: TaskRequest[];
}
