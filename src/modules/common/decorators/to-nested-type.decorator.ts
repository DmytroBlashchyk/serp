import { ManagedResponseType } from 'modules/common/decorators/managed-response.type';
import { Transform, TransformFnParams } from 'class-transformer';

function toNestedType<T>(v: any[], cls: ManagedResponseType<T>): T | T[] {
  if (!v) return v;
  return Array.isArray(v) ? v.map((v) => new cls(v)) : new cls(v);
}

export function ToNestedType<T>(
  cls: ManagedResponseType<T>,
): (target: unknown, key: string) => void {
  return Transform((params: TransformFnParams) =>
    toNestedType(params.value, cls),
  );
}
