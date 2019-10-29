declare module 'ipfs-unixfs-importer' {
  import { Readable } from 'stream'
  import Ipld from 'ipld'
  import CID from 'cids'
  import UnixFS from 'ipfs-unixfs'

  interface ChunkerOptions {
    minChunkSize?: number
    maxChunkSize?: number
    avgChunkSize?: number
    window?: number
    polynomial?: number
  }

  interface BuilderOptions {
    maxChildrenPerNode?: number
    layerRepeat?: number
  }

  type Codec = 'dag-pb' | 'dag-cbor' | 'raw'

  type LeafType = 'file' | 'raw'

  export interface Options {
    chunker?: 'fixed' | 'rabin'
    rawLeaves?: boolean
    hashOnly?: boolean
    strategy?: 'balanced' | 'flat' | 'trickle'
    reduceSingleLeafToSelf?: boolean
    codec?: Codec
    format?: Codec
    hashAlg?: string
    leafType?: LeafType
    cidVersion?: number
    progress?: Function
    wrapWithDirectory?: boolean
    shardSplitThreshold?: number
    onlyHash?: boolean
    chunkerOptions?: ChunkerOptions,
    builderOptions?: BuilderOptions,
    wrap?: boolean
    pin?: boolean
    recursive?: boolean
    hidden?: boolean
    preload?: boolean
  }

  export interface File {
    path: string
    content: Buffer | Iterable<Buffer> | Readable
  }

  export interface Result {
    cid: CID,
    path: string,
    unixfs: UnixFS,
    size?: number
  }

  function importer(source: File[], ipld: Ipld, options: Options): AsyncIterable<Result>
  // eslint-disable-next-line import/no-default-export
  export default importer
}
