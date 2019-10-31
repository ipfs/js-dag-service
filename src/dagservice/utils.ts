// export interface ExtendedIterable<T> extends Iterable<T> {
//   first(): T
//   last(): T
//   all(): Array<T>
// }

export const first = async <T>(iterator: Iterable<T>) => {
  for await (const value of iterator) {
    return value
  }
}

export const last = async <T>(iterator: Iterable<T>) => {
  let value
  for await (value of iterator) {
    // Intentionally empty
  }
  return value
}

export const all = async <T>(iterator: Iterable<T>) => {
  const values = []
  for await (const value of iterator) {
    values.push(value)
  }
  return values
}
