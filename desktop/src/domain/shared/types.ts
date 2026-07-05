/** 错误处理结果类型 */
export type Result<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export function Ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function Err<E = string>(error: E): Result<never, E> {
  return { ok: false, error };
}

/** 生成唯一 ID */
export function newId(): string {
  return crypto.randomUUID();
}
