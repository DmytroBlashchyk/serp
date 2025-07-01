import { IsArray, IsNumber, IsObject, IsString } from 'class-validator';
import { TaskDataRequest } from 'modules/fastify/requests/task-data.request';
import { TaskResultRequest } from 'modules/fastify/requests/task-result.request';

export class TaskRequest {
  @IsString()
  id: string;

  @IsNumber()
  status_code: number;

  @IsString()
  status_message: string;

  @IsString()
  time: string;

  @IsNumber()
  cost: number;

  @IsNumber()
  result_count: number;

  @IsArray()
  path: any[];

  @IsObject({ context: TaskDataRequest })
  data: TaskDataRequest;

  @IsArray({ context: TaskResultRequest })
  result: TaskResultRequest[];
}
