import Libp2p from 'libp2p'
import Bitswap from 'ipfs-bitswap'
import Ipld from 'ipld'
import CID from 'cids'
import { BlockService } from './blockservice'
import { BlockStore } from './blockstore'
import { addFile, getFile, AddOptions, GetOptions, File } from './utils'

export { BlockService } from './blockservice'
export { BlockStore, Block } from './blockstore'
export { setupLibP2PHost, Result } from './utils'
// Include MemoryDatastore for user convenience
export { MemoryDatastore } from 'interface-datastore'

const BufferImpl = Buffer
export { BufferImpl as Buffer }

/**
 * `Options` wraps configuration options for the IPFS Lite peer.
 */
export interface Options {
  /**
   * `offline` controls whether or not the block service will announce or retrieve blocks from the network.
   */
  offline: boolean
}

/**
 * Peer is an IPFS Lite peer.
 * It provides a DAG service that can fetch and put blocks from/to the IPFS network.
 *
 */
export class Peer extends Ipld {
  public config: Options
  public host: Libp2p
  public store: BlockStore
  private blockExchange: Bitswap
  // private blockService: BlockService

  /**
   * `Peer` creates a new IPFS Lite peer.
   *
   * @param store The underlying datastore for locally caching immutable blocks of data.
   * @param host The Libp2p host to use for interacting with the network.
   * @param config An optional set of configuration options. Currently only supports whether or not the peer should
   * run in 'offline' mode.
   */
  constructor(store: BlockStore, host: Libp2p, config: Options = { offline: false }) {
    const blockExchange = new Bitswap(host, store)
    const blockService = new BlockService(store, config.offline ? undefined : blockExchange)
    super({ blockService })
    this.host = host
    this.store = store
    this.config = config
    this.blockExchange = blockExchange
    // this.blockService = blockService
  }

  /**
   * `start` starts the underlying host and block exchange.
   * @example
   * const peer = new Peer(...)
   * await peer.start()
   * // do stuff with it...
   * await peer.stop()
   */
  async start() {
    await this.host.start()
    this.blockExchange.start()
  }

  /**
   * `stop` stops the underlying block exchange and host.
   * @example
   * const peer = new Peer(...)
   * await peer.start()
   * // do stuff with it...
   * await peer.stop()
   */
  async stop() {
    this.blockExchange.stop()
    await this.host.stop()
  }

  /**
   * `hasBlock` returns whether a given block is available locally.
   * This method is shorthand for .store.has().
   * @param cid The target content identifier.
   * @example
   * const peer = new Peer(...)
   * await peer.start()
   * const has = await peer.hasBlock('bafk...uny')
   * console.log(has)
   * await peer.stop()
   */
  async hasBlock(cid: CID) {
    return this.store.has(cid)
  }

  /**
   * `addFile` chunks and adds content to the DAG service.
   *
   * The content is stored as a UnixFS DAG (default for IPFS). It returns the root ipld DAG node.
   *
   * See https://github.com/ipfs/js-ipfs-unixfs-importer for further details.
   * @param source An iterable that yields file objects with `path` and `content` keys.
   * @param options A set of options that control the layout and chunking mechanisms used by the underlying
   * UnixFS library.
   * @example
   * const peer = new Peer(...)
   * await peer.start()
   * const source = [
   *   {
   *     path: 'bar',
   *     content: fs.createReadStream('bar.txt'),
   *   },
   * ]
   * const root = await peer.addFile(source)
   * console.log(root.cid.toString())
   * await peer.stop()
   */
  async addFile(source: Iterable<File>, options?: AddOptions) {
    return addFile(source, this, options)
  }

  /**
   * `getFile` returns the content of a file as identified by its root CID.
   *
   * The file must have been added as a UnixFS DAG (default for IPFS).
   *
   * @param cid The target content identifier.
   * @example
   * const peer = new Peer(...)
   * await peer.start()
   * const buf = await peer.getFile('bafk...uny')
   * console.log(buf.toString())
   * await peer.stop()
   */
  async getFile(cid: CID | Buffer | string, options?: GetOptions) {
    return getFile(cid, this, options)
  }
}
