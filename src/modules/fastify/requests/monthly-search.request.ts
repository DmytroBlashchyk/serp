import { IsNumber } from 'class-validator';

export class MonthlySearchRequest {
  @IsNumber()
  year: number;
  @IsNumber()
  month: number;
  @IsNumber()
  search_volume: number;
}
