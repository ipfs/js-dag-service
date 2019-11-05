declare module 'ipld-block' {
  import CID from 'cids'

  export class Block {
    constructor (data: Buffer, cid: CID)
    data: Buffer
    cid: CID
  }

  // eslint-disable-next-line import/no-default-export
  export default Block
}

declare module '@ipld/block' {
  import CID from 'cids'
  import Codec, { Reader } from '@ipld/codec-interface'

  export interface Options {
    source?: object
    data?: Buffer
    codec?: string
    cid?: CID | string
    algo?: string
  }
  class Block<T = any> {
    opts: Options
    readonly codec: string
    constructor (opts: Options)
    source(): T | null
    cid(): Promise<CID>
    validate(): boolean
    encode(): Buffer
    decode(): T
    reader(): Reader<T>
  }
  namespace Block {
    export function getCodec<T>(codec: string): Codec<T>
    export function encoder<T>(source: T, codec: string, algo?: string): Block<T>
    export function decoder<T = any>(data: Buffer, codec: string, algo: string): Block<T>
    export function create<T = any>(data: Buffer, cid: CID /*, validate: boolean */): Block<T>
  }
  // eslint-disable-next-line import/no-default-export
  export default Block
}

