import Libp2p from 'libp2p'
import Bitswap from 'ipfs-bitswap'
import CID from 'cids'
import { BlockService } from './blockservice'
import { BlockStore } from './blockstore'
import { DAGService } from './dagservice'

/**
 * PeerOptions wraps configuration options for the IPFS Lite peer.
 */
export interface PeerOptions {
  /**
   * offline controls whether or not the block service will announce or retrieve blocks from the network.
   */
  offline: boolean
}

/**
 * Peer is an IPFS Lite peer. It provides a DAG service that can fetch and put blocks from/to the IPFS network.
 *
 * It casually satisfies the original IPFS Lite interface: https://github.com/hsanjuan/ipfs-lite.
 */
export class Peer extends DAGService {
  /**
   * config is a set of options to configure the IPFS Lite peer.
   */
  public config: PeerOptions
  /**
   * host is the Libp2p host used to interact with the network.
   */
  public host: Libp2p
  /**
   * store is the underlying block store for locally caching immutable blocks of data.
   */
  public store: BlockStore
  /**
   * blockExchange is the "bitswap" instance that communicates with the network to retrieve blocks that are not in
   * the local store.
   */
  public blockExchange: Bitswap
  /**
   * blockService is a content-addressable store for adding, deleting, and retrieving blocks of immutable data.
   */
  public blockService: BlockService

  /**
   * Peer creates a new IPFS Lite peer.
   *
   * @param {BlockStore} store The underlying block store for locally caching immutable blocks of data.
   * @param {Libp2p} host The Libp2p host to use for interacting with the network.
   * @param {PeerOptions} config An optional set of configuration options. Currently only supports whether or not the
   * peer should run in 'offline' mode.
   */
  constructor(store: BlockStore, host: Libp2p, config: PeerOptions = { offline: false }) {
    const blockExchange = new Bitswap(host, store)
    const blockService = new BlockService(store, config.offline ? undefined : blockExchange)
    super({ blockService })
    this.host = host
    this.store = store
    this.config = config
    this.blockExchange = blockExchange
    this.blockService = blockService
  }

  /**
   * start starts the underlying host and block exchange.
   *
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
   * stop stops the underlying block exchange and host.
   *
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
   * hasBlock returns whether a given block is available locally. This method is shorthand for .store.has().
   *
   * @param {CID} cid The target content identifier.
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
   * isOnline returns whether the peer has a valid block exchange and its p2p host has been started.
   */
  isOnline() {
    return this.blockExchange && this.host && this.host.isStarted()
  }

  /**
   * dag provides access to the underlying DAG service.
   *
   * The dag API supports the creation and manipulation of dag-pb objects, as well as other IPLD formats
   * (i.e dag-cbor, ethereum-block, git, etc). Use it to put, get, and walk IPLD DAG objects.
   */
  get dag() {
    return this
  }
}
