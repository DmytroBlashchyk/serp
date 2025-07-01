import { ScheduleTypesEnum } from 'modules/additional-services/enums/schedule-types.enum';

export interface BatchResponseType {
  id: string;
  created_at: Date;
  last_run?: Date;
  name: string;
  schedule_type: ScheduleTypesEnum;
  enabled: boolean;
  status: string;
  searches_total_count: number;
  searches_page_count: number;
  credits_required: number;
  next_result_set_id: number;
  results_count: number;
  priority: string;
  destination_ids: any[];
  notification_webhook: string;
  notification_email: string;
  notification_as_csv: boolean;
  searches_type: string;
  searches_type_locked: boolean;
}
