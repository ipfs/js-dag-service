import Libp2p from 'libp2p'
import Bitswap from 'ipfs-bitswap'
import Ipld from 'ipld'
import { BlockService } from './blockservice'
import { BlockStore } from './blockstore'

export { BlockService } from './blockservice'
export { BlockStore, Block } from './blockstore'

/**
 * `Options` wraps configuration options for the IPFS Lite Peer.
 */
export interface Options {
  /**
   * `offline` controls whether or not the block service will announce or retrieve blocks from the network.
   */
  offline: boolean
}

// Peer is an IPFS-Lite peer. It provides a DAG service that can fetch and put blocks from/to the IPFS network.
export class Peer extends Ipld {
  public config: Options
  public host: Libp2p
  public store: BlockStore
  private blockService: BlockService
  private blockExchange: Bitswap

  /**
   * Initialize an IPFS-Lite Peer
   */
  constructor(store: BlockStore, host: Libp2p, config: Options = { offline: false }) {
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
}
