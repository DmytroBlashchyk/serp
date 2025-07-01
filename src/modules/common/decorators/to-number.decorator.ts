import { Transform, TransformFnParams } from 'class-transformer';

export function toNumber(value: any) {
  const res: number = +value;
  return isNaN(res) ? null : res;
}

export function ToNumber(): (target: any, key: string) => void {
  return Transform((params: TransformFnParams) => toNumber(params.value));
}
