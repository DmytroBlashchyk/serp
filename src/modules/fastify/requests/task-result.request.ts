import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { MonthlySearchRequest } from 'modules/fastify/requests/monthly-search.request';

export class TaskResultRequest {
  @IsString()
  keyword: string;

  @IsNumber()
  location_code: number;
  @IsNumber()
  language_code: number;
  @IsBoolean()
  search_partners: boolean;
  @IsString()
  competition: string;
  @IsNumber()
  competition_index: number;
  @IsNumber()
  search_volume: number;

  @IsNumber()
  @IsOptional()
  cpc?: number;

  @IsArray({ context: MonthlySearchRequest })
  monthly_searches: MonthlySearchRequest[];

  @IsArray()
  @IsOptional()
  items: any[];
}
