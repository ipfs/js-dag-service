import Libp2p from 'libp2p'
import Bitswap from 'ipfs-bitswap'
import Ipld from 'ipld'
import { BlockService } from './blockservice'
import { BlockStore } from './blockstore'

export { BlockService } from './blockservice'
export { BlockStore, Block } from './blockstore'

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
  public store: BlockStore
  private blockService: BlockService
  private blockExchange: Bitswap
  // reprovider: Reprovider
  // @todo: Once https://github.com/ipfs/js-ipfs/pull/2184/files
  //        and https://github.com/ipfs/js-ipfs-bitswap/pull/199 lands, use that for reprovider.

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
