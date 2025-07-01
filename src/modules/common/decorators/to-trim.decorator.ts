import { Transform, TransformFnParams } from 'class-transformer';

export function toTrim(value: any) {
  return value.trim();
}

export function ToTrimDecorator(): (target: any, key: string) => void {
  return Transform((params: TransformFnParams) => toTrim(params.value));
}
