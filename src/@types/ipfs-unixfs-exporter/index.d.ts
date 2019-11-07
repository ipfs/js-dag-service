declare module 'ipfs-unixfs-exporter' {
  import { Readable } from 'stream'
  import Ipld from 'ipld'
  import CID from 'cids'
  import UnixFS from 'ipfs-unixfs'

  export interface Options{
    offset?: number
    length?: number
  }

  export interface Entry {
    name: string
    path: string
    cid: CID
    node: any
    content?(opts?: Options): AsyncIterable<Buffer | Entry>
    unixfs?: UnixFS
  }

  function exporter(cid: CID | Buffer | string, ipld: Ipld): Promise<Entry>

  namespace exporter {
    export function path(cid: CID | Buffer | string, ipld: Ipld): AsyncIterable<Entry>
    export function recursive(cid: CID | string, ipld: Ipld): AsyncIterable<Entry>
  }

  // eslint-disable-next-line import/no-default-export
  export default exporter
}
