import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { SortOrderEnum } from 'modules/common/enums/sort-order.enum';

export type ClassType<T = any> = new (...args: any[]) => T;

/**
 * Extends a given class with sorting functionality.
 *
 * The resulting class includes properties for specifying sorting criteria and order.
 *
 * @param {T} sortBy - The enumeration defining the sorting criteria.
 * @param {ClassType} ResourceCls - The base class to be extended.
 * @return {ClassType} - A new class that extends the base class with sorting properties.
 */
export function WithSorting<T extends any>(sortBy: T, ResourceCls: ClassType) {
  class SortingRequest extends ResourceCls {
    @ApiProperty({ enum: sortBy, required: false, nullable: false })
    @IsEnum(sortBy as object)
    @IsOptional()
    sortBy: keyof T;

    @ApiProperty({
      required: false,
      enum: SortOrderEnum,
      default: SortOrderEnum.desc,
    })
    @IsEnum(SortOrderEnum)
    sortOrder: SortOrderEnum = SortOrderEnum.desc;
  }
  return SortingRequest;
}
