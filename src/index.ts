import Libp2p from 'libp2p'
import Bitswap from 'ipfs-bitswap'
import Ipld from 'ipld'
import CID from 'cids'
import exporter, { Entry } from 'ipfs-unixfs-exporter'
import importer, { Options as ImportOptions, File, Result } from 'ipfs-unixfs-importer'
import { BlockService } from './blockservice'
import { Blockstore } from './blockstore'

// Options wraps configuration options for the Peer.
export interface Options {
  // The DAGService will not announce or retrieve blocks from the network if offline is true.
  offline: boolean
  // reprovideInterval sets how often to reprovide records to the DHT in hours.
  // reprovideInterval: number // default=12
}

// Peer is an IPFS-Lite peer. It provides a DAG service that can fetch and put blocks from/to the IPFS network.
export class Peer extends Ipld {
  // Ipld makes us a "DAG service"
  public config: Options
  public host: Libp2p
  public store: Blockstore
  private blockService: BlockService
  private blockExchange: Bitswap
  // reprovider: Reprovider
  // @todo: Once https://github.com/ipfs/js-ipfs/pull/2184/files
  //        and https://github.com/ipfs/js-ipfs-bitswap/pull/199 lands, use that for reprovider.

  /**
   * Initialize an IPFS-Lite Peer
   */
  constructor(store: Blockstore, host: Libp2p, config: Options = { offline: false }) {
    const blockExchange = new Bitswap(host, store)
    const blockService = new BlockService(store, config.offline ? undefined : blockExchange)
    super({ blockService })
    this.host = host
    this.store = store
    this.config = config
    this.blockService = blockService
    this.blockExchange = blockExchange
  }

  async start() {
    await this.host.start()
    this.blockExchange.start()
  }

  async stop() {
    this.blockExchange.stop()
    await this.host.stop()
  }

  /**
   * AddFile chunks and adds content to the DAGService from a reader. The content is stored as a UnixFS DAG
   * (default for IPFS). It returns the root IPLD node.
   * @param file Object with path and content keys.
   * @param options Configurable parameters needed to specify the importing process of a file.
   */
  async addFile(file: File, options?: ImportOptions) {
    const opts = { cidVersion: 1, ...(options || {}) }
    let result: Result | undefined
    for await (const entry of importer(file, this, opts)) {
      result = entry
    }
    return result
  }

  async getFile(cid: CID): Promise<Entry> {
    return exporter(cid, this)
  }

  async hasBlock(cid: CID) {
    return this.store.has(cid)
  }
}
