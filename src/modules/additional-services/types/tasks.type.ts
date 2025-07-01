import { TaskDataType } from 'modules/additional-services/types/task-data.type';

export interface TasksType {
  id: string;
  status_code: number;
  status_message: string;
  time: string;
  cost: number;
  result_count: number;
  path: string[];
  data: TaskDataType;
  result: any;
}
