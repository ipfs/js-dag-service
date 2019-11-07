import Libp2p from 'libp2p'
import Bitswap from 'ipfs-bitswap'
import Ipld from 'ipld'
import { BlockService } from './blockservice'
import { BlockStore } from './blockstore'

export { BlockService } from './blockservice'
export { BlockStore, Block } from './blockstore'
export { setupLibP2PHost } from './utils'

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
   * Start the underlying host and block exchange if they haven't already been started.
   */
  async start() {
    await this.host.start()
    this.blockExchange.start()
  }

  /**
   * Stop the underlying block exchange and host if they haven't already been stopped.
   */
  async stop() {
    this.blockExchange.stop()
    await this.host.stop()
  }
}
