/**
 * Result<T, E> — Type-safe error handling
 *
 * Represents either a successful result (Ok) or an error (Err).
 * Forces explicit error handling at compile time.
 *
 * @example
 *   // Success case
 *   return ok({ reply: "Hello!" });
 *
 *   // Error case
 *   return err({ code: "INVALID_INPUT", message: "User message too long" });
 *
 *   // Usage:
 *   const result = await nodeAIReasoning(input, ctx);
 *   if (result.isOk()) {
 *     console.log(result.value.reply);
 *   } else {
 *     console.error(result.error.code, result.error.message);
 *   }
 */

export type Result<T, E> = Ok<T> | Err<E>;

export class Ok<T> {
  readonly isError = false;
  constructor(readonly value: T) {}

  isOk(): this is Ok<T> {
    return true;
  }

  isErr(): this is Err<never> {
    return false;
  }

  /**
   * Extract value or throw if error
   */
  unwrap(): T {
    return this.value;
  }

  /**
   * Extract value or return default if error
   */
  unwrapOr(defaultValue: T): T {
    return this.value;
  }

  /**
   * Map value to new Result
   */
  andThen<U, E>(fn: (val: T) => Result<U, E>): Result<U, E> {
    return fn(this.value);
  }

  /**
   * Transform value
   */
  map<U>(fn: (val: T) => U): Result<U, never> {
    return ok(fn(this.value));
  }

  /**
   * Transform error (no-op on Ok)
   */
  mapErr<F>(fn: (err: never) => F): Result<T, F> {
    return this as any;
  }
}

export class Err<E> {
  readonly isError = true;
  constructor(readonly error: E) {}

  isOk(): this is Ok<never> {
    return false;
  }

  isErr(): this is Err<E> {
    return true;
  }

  /**
   * Extract value or throw error
   */
  unwrap(): never {
    if (this.error instanceof Error) {
      throw this.error;
    }
    throw new Error(JSON.stringify(this.error));
  }

  /**
   * Extract value or return default
   */
  unwrapOr<T>(defaultValue: T): T {
    return defaultValue;
  }

  /**
   * Chain to next operation (short-circuits on error)
   */
  andThen<T, U>(fn: (val: T) => Result<U, E>): Result<U, E> {
    return this as any;
  }

  /**
   * Transform value (no-op on Err)
   */
  map<T, U>(fn: (val: T) => U): Result<U, E> {
    return this as any;
  }

  /**
   * Transform error
   */
  mapErr<F>(fn: (err: E) => F): Result<never, F> {
    return err(fn(this.error));
  }
}

/**
 * Create a success result
 */
export function ok<T>(value: T): Result<T, never> {
  return new Ok(value);
}

/**
 * Create an error result
 */
export function err<E>(error: E): Result<never, E> {
  return new Err(error);
}

/**
 * Try executing a function and wrap result
 */
export async function tryCatch<T, E>(
  fn: () => Promise<T>,
  mapError: (err: any) => E
): Promise<Result<T, E>> {
  try {
    const value = await fn();
    return ok(value);
  } catch (e) {
    return err(mapError(e));
  }
}

/**
 * Combine multiple results; short-circuits on first error
 */
export function combine<T extends readonly any[]>(
  ...results: T
): Result<
  { [K in keyof T]: T[K] extends Result<infer U, any> ? U : never },
  { [K in keyof T]: T[K] extends Result<any, infer E> ? E : never }[number]
> {
  const values: any[] = [];
  for (const result of results) {
    if (result.isErr()) {
      return result as any;
    }
    values.push(result.value);
  }
  return ok(values) as any;
}

/**
 * Type guard: check if result is Ok
 */
export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.isOk();
}

/**
 * Type guard: check if result is Err
 */
export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return result.isErr();
}
