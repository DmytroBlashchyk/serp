import { Transform, TransformFnParams } from 'class-transformer';

export function toLowerCase(value: any) {
  return value.toLowerCase();
}

export function ToLowerCase(): (target: any, key: string) => void {
  return Transform((params: TransformFnParams) => toLowerCase(params.value));
}
