declare module 'ipld' {
  import BlockService from 'ipfs-block-service'
  import CID from 'cids'

  interface Options {
    blockService: BlockService
    formats?: Function[],
    loadFormat?: Function
  }

  interface AddOptions {
    hashAlg?: string
    cidVersion?: number
    onlyHash?: boolean
  }

  class Ipld {
    constructor(opts: {})
    put(node: object, format: string, options?: AddOptions): Promise<CID>
    putMany(nodes: AsyncIterable<object>, format: string, options?: AddOptions): Promise<AsyncIterable<CID>>
    resolve(cid: CID, path: string): Promise<AsyncIterable<{ remainderPath: string, value: any}>>
    get(cid: CID): any
    getMany(cids: AsyncIterable<CID>): Promise<AsyncIterable<any>>
    remove(cid: CID): void
    removeMany(cids: AsyncIterable<CID>): void
    tree(cid: CID, path?: string, options?: { recursive: boolean }): Promise<AsyncIterable<string>>
    addFormat(ipldFormatImplementation: Function): Ipld
    removeFormat(codec: any): Ipld
    defaultOptions: AddOptions
  }
  // eslint-disable-next-line import/no-default-export
  export default Ipld
}
