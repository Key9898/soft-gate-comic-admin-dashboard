export function toLaneError(reason: unknown): Error {
  return reason instanceof Error ? reason : new Error('Request failed');
}

export function applyLaneSettle<T>(
  result: PromiseSettledResult<T>,
  previous: T,
  hadSuccess: boolean,
  empty: T,
): { value: T; error: Error | null; hadSuccess: boolean } {
  if (result.status === 'fulfilled') {
    return { value: result.value, error: null, hadSuccess: true };
  }
  return {
    value: hadSuccess ? previous : empty,
    error: toLaneError(result.reason),
    hadSuccess,
  };
}

export function mapFulfilled<T, U>(
  result: PromiseSettledResult<T>,
  map: (value: T) => U,
): PromiseSettledResult<U> {
  if (result.status === 'fulfilled') {
    return { status: 'fulfilled', value: map(result.value) };
  }
  return result;
}
