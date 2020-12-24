import CID from "cids";
import { BlockStore, Block } from "./blockstore";

export interface Exchange {
  put(block: Block): Promise<void>;
  putMany(blocks: Iterable<Block>): Promise<void>;
  get(cid: CID): Promise<Block>;
  getMany(cids: Iterable<CID>): AsyncIterableIterator<Block>;
  start(): Promise<void>;
  stop(): void;
}

/**
 * BlockService is a content-addressable store for adding, deleting, and retrieving blocks of immutable data.
 * A block service is backed by a block store as its datastore for blocks, and uses an "exchange" (Bitswap) to fetch
 * blocks from the network. This implementation is a simplified variant of the official IPFS block service, requiring
 * only a simple block store (not a full IPFS repo), and reference to a Bitswap exchange.
 *
 * It satisfies the default IPFS block service interface: https://github.com/ipfs/js-ipfs-block-service.
 */
export class BlockService {
  /**
   * BlockService creates a new block service.
   *
   * @param {BlockStore} store The block store to use for local block storage.
   * @param {Bitswap} exchange Add a "Bitswap" instance that communicates with the network to retrieve blocks that
   * are not in the local store. If the node is online, all requests for blocks first check locally and then ask
   * the network for the blocks. To 'go offline', simply set `exchange` to undefined or null.
   */
  constructor(public store: BlockStore, public exchange?: Exchange) {}

  /**
   * online returns whether the block service is online or not. i.e. does it have a valid exchange?
   */
  online(): boolean {
    return this.exchange != null;
  }

  /**
   * put adds a block to the underlying block store.
   *
   * @param {Block} block An immutable block of data.
   */
  async put({ data, cid }: Block): Promise<void> {
    if (this.exchange != null) {
      // The Exchange only understands legacy CIDs
      cid = new CID(cid.toString());
      return this.exchange.put({ data, cid });
    } else {
      return this.store.put({ data, cid });
    }
  }

  /**
   * putMany adds multiple blocks to the underlying block store.
   *
   * @param {Iterable<Block>} blocks An iterable of immutable blocks of data.
   */
  async putMany(blocks: Iterable<Block>): Promise<void> {
    if (this.exchange != null) {
      const old = [];
      // eslint-disable-next-line prefer-const
      for (let { data, cid } of blocks) {
        cid = new CID(cid.toString());
        old.push({ data, cid });
      }
      return this.exchange.putMany(blocks);
    } else {
      return this.store.putMany(blocks);
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
      // The Exchange only understands legacy CIDs
      cid = new CID(cid.toString());
      return this.exchange.get(cid);
    } else {
      return this.store.get(cid);
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
      const old = [];
      // eslint-disable-next-line prefer-const
      for (let cid of cids) {
        old.push(new CID(cid.toString()));
      }
      return this.exchange.getMany(cids);
    } else {
      for (const cid of cids) {
        yield this.store.get(cid);
      }
    }
  }

  /**
   * delete removes a block from the local block store.
   *
   * @param {CID} cid The content identifier for an immutable block of data.
   */
  async delete(cid: CID): Promise<CID> {
    await this.store.delete(new CID(cid.toString()));
    return cid;
  }
}
