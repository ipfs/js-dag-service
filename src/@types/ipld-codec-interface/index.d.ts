declare module '@ipld/codec-interface' {
  import CID from 'cids'

  export interface Reader<T> {
    get(path: string): { value: T, remaining?: string }
    links(): IterableIterator<[string, CID]>
    tree(): IterableIterator<string>
  }

  export type EncodeFunction<T> = (obj: T) => Buffer | Promise<Buffer>
  export type DecodeFunction<T> = (buf: Buffer) => T | Promise<T>

  interface Codec<T = any> {
    encode: EncodeFunction<T>
    decode: DecodeFunction<T>
    codec: string
    reader(): Reader<T> | Promise<Reader<T>>
  }

  namespace Codec {
    export function create<T = any>(encode: EncodeFunction<T>, decode: DecodeFunction<T>, codecName: string): Codec<T>
  }

  // eslint-disable-next-line import/no-default-export
  export default Codec
}
