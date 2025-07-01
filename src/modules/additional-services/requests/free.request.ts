import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  IsIP,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { IsId } from 'modules/common/decorators/is-id.decorator';
import { IdType } from 'modules/common/types/id-type.type';
import { IsValidRealDomain } from 'modules/common/decorators/is-valid-real-domain.decorator';

export class FreeRequest {
  @ApiProperty()
  @IsValidRealDomain({ nullable: false, each: false })
  domainName: string;

  @ApiProperty()
  @IsId()
  countryId: IdType;

  @ApiProperty({ enum: DeviceTypesEnum })
  @IsEnum(DeviceTypesEnum)
  deviceType: DeviceTypesEnum;

  @ApiProperty({ required: false, isArray: true, type: String })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(5, { message: 'Please enter a maximum of 5 keywords.' })
  keywords: string[];

  @ApiProperty({ required: false, isArray: true, type: String })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @Length(3, 255, { each: true })
  @IsOptional()
  competitorDomains: string[];

  @ApiProperty()
  @IsIP()
  ipAddress: string;
}
