import { IsString } from 'class-validator';

export class TestRequest {
  @IsString()
  search: string;
}
