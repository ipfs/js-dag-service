import CID from 'cids'
import { BlockStore, Block } from './blockstore'

// @todo: Replace with proper types
type Bitswap = any

/**
 * BlockService is a content-addressable store for adding, deleting, and retrieving blocks of immutable data.
 * A block service is backed by a block store as its datastore for blocks, and uses an "exchange" (bitswap) to fetch
 * blocks from the network. This implementation is a simplified variant of the official IPFS block service, requiring
 * only a simple block store (not a full IPFS repo), and reference to a bitwap exchange.
 *
 * It satisfies the default IPFS block service interface: https://github.com/ipfs/js-ipfs-block-service.
 */
export class BlockService {
  /**
   * BlockService creates a new block service.
   *
   * @param {BlockStore} store The block store to use for local block storage.
   * @param {Bitswap} exchange Add a "bitswap" instance that communicates with the network to retrieve blocks that
   * are not in the local store. If the node is online, all requests for blocks first check locally and then ask
   * the network for the blocks. To 'go offline', simply set `exchange` to undefined or null.
   */
  constructor(public store: BlockStore, public exchange?: Bitswap) {}

  /**
   * online returns whether the block service is online or not. i.e. does it have a valid exchange?
   */
  online() {
    return this.exchange != null
  }

  /**
   * put adds a block to the underlying block store.
   *
   * @param {Block} block An immutable block of data.
   */
  async put(block: Block) {
    if (this.exchange != null) {
      return this.exchange.put(block)
    } else {
      return this.store.put(block)
    }
  }

  /**
   * putMany adds multiple blocks to the underlying block store.
   *
   * @param {Iterable<Block>} blocks An iterable of immutable blocks of data.
   */
  async putMany(blocks: Iterable<Block>) {
    if (this.exchange != null) {
      return this.exchange.putMany(blocks)
    } else {
      return this.store.putMany(blocks)
    }
  }

  /**
   * get returns a block by its content identifier.
   * If the block is not available locally and the exchange is online, it will request the block from the network.
   *
   * @param {CID} cid The content identifier for an immutable block of data.
   */
  async get(cid: CID): Promise<Block> {
    if (this.exchange != null) {
      return this.exchange.get(cid)
    } else {
      return this.store.get(cid)
    }
  }

  /**
   * getMany returns multiple blocks from an iterable of content identifiers.
   * If any of the blocks are not available locally and the exchange is online, it will request the block(s) from the
   * exchange/network.
   *
   * @param {Iterable<CID>} cids Iterable of content identifiers for immutable blocks of data.
   */
  async *getMany(cids: Iterable<CID>): AsyncIterableIterator<Block> {
    if (this.exchange != null) {
      return this.exchange.getMany(cids)
    } else {
      for (const cid of cids) {
        yield this.store.get(cid)
      }
    }
  }

  /**
   * delete removes a block from the local block store.
   *
   * @param {CID} cid The content identifier for an immutable block of data.
   */
  async delete(cid: CID) {
    await this.store.delete(cid)
    return cid
  }
}
