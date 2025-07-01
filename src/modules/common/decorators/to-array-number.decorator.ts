import { toNumber } from 'modules/common/decorators/to-number.decorator';
import { Transform, TransformFnParams } from 'class-transformer';

export function toArrayNumber(v: any): number[] {
  if (v === null) {
    return v;
  }
  return Array.isArray(v)
    ? v.map((v) => toNumber(v))
    : v
        .trim()
        .split(',')
        .map((i: string) => toNumber(i));
}

export function ToArrayNumber(): (target: any, key: string) => void {
  return Transform((params: TransformFnParams) => toArrayNumber(params.value));
}
