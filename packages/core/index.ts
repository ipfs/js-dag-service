import * as utils from './utils'
export { utils }
export { Block, BlockStore } from './blockstore'
export { BlockService } from './blockservice'
export { DAGService, DAGOptions, AddOptions } from './dagservice'
export { Peer, PeerOptions } from './peer'


// export interface ExtendedIterable<T> extends Iterable<T> {
//   first(): Promise<T | undefined>
//   last(): Promise<T | undefined>
//   all(): Promise<Array<T>>
// }

// const first = async <T>(iterator: Iterable<T>) => {
//   for await (const value of iterator) {
//     return value
//   }
// }

// const last = async <T>(iterator: Iterable<T>) => {
//   let value
//   for await (value of iterator) {
//     // Intentionally empty
//   }
//   return value
// }

// const all = async <T>(iterator: Iterable<T>) => {
//   const values = []
//   for await (const value of iterator) {
//     values.push(value)
//   }
//   return values
// }

// export function extendIterator<T>(iterator: Iterable<T>) {
//   const aug = iterator as ExtendedIterable<T>
//   aug.first = () => first(iterator)
//   aug.last = () => last(iterator)
//   aug.all = () => all(iterator)
//   return aug
// }
