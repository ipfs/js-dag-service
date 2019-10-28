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

  export interface Options {
    source?: object
    data?: Buffer
    codec?: string
    cid?: CID | string
    algo?: string
  }
  class Reader {
    decoded: object
    constructor (decoded: object)
    get(path: string): { value: object, remaining?: string }
    links(): IterableIterator<[string, CID]>
    tree(): IterableIterator<string>
  }
  class Block {
    opts: Options
    readonly codec: string
    constructor (opts: Options)
    source(): object | null
    cid(): Promise<CID>
    validate(): boolean
    encode(): Buffer
    decode(): object
    reader(): Reader
  }
  interface Codec {
    codec: string
    encode(obj: object): Buffer | Promise<Buffer>
    decode(buf: Buffer): object | Promise<Buffer>
    reader(block: Block): Reader | Promise<Reader>
  }
  namespace Block {
    export function getCodec(codec: string): Codec
    export function encoder(source: object, codec: string, algo: string): Block
    export function decoder(data: Buffer, codec: string, algo: string): Block
    export function create(data: Buffer, cid: CID /*, validate: boolean */): Block
  }
  // eslint-disable-next-line import/no-default-export
  export default Block
}

