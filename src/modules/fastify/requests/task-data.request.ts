import { IsArray, IsBoolean, IsString } from 'class-validator';

export class TaskDataRequest {
  @IsString()
  api: string;
  @IsString()
  function: string;
  @IsString()
  se: string;
  @IsString({ each: true })
  keywords: string[];
  @IsBoolean()
  search_partners: boolean;
  @IsString()
  language_name: string;
  @IsString()
  location_name: string;
  @IsString()
  postback_url: string;
  @IsString()
  tag: string;
}
