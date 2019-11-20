import CID from 'cids'
import { Query, Key, Datastore, Result } from 'interface-datastore'

/**
 * Block represents an immutable block of data that is uniquely referenced with a cid.
 *
 * This is equivalent to https://github.com/ipld/js-ipld-block.
 */
export class Block {
  /**
   * Block creates an immutable block of data with the given content identifier (CID).
   * @param data The data to be stored in the block as a buffer.
   * @param cid The content identifier of the data.
   */
  constructor(readonly data: Buffer, readonly cid: CID) {}
}

/**
 * Blockstore is a simple key/value store for adding, deleting, and retrieving immutable blocks of data.
 *
 * This is equivalent to https://github.com/ipfs/js-ipfs-repo/blob/master/src/blockstore.js.
 */
export class BlockStore {
  /**
   * BlockStore creates a new block store.
   *
   * @param store The underlying datastore for locally caching immutable blocks of data.
   */
  constructor(private store: Datastore) {}

  /**
   * cidToKey transforms a CID to the appropriate block store key.
   *
   * @param cid The content identifier for an immutable block of data.
   */
  static cidToKey = (cid: CID) => {
    if (!CID.isCID(cid)) {
      throw new Error('Not a valid CID')
    }
    // We'll only deal with CID version 1
    return new Key('/' + cid.toV1().toString(), false)
  }

  /**
   * keyToCid transforms a block store key to a CID.
   *
   * @param key The key used to encode the CID.
   */
  static keyToCid = (key: Key) => {
    return new CID(key.toString().slice(1))
  }

  /**
   * put adds a block to the block store.
   *
   * @param block An immutable block of data.
   */
  async put(block: Block) {
    const k = BlockStore.cidToKey(block.cid)
    if (await this.store.has(k)) {
      return
    }
    return this.store.put(k, block.data)
  }

  /**
   * get returns a block by cid.
   *
   * @param cid The content identifier for an immutable block of data.
   */
  async get(cid: CID) {
    const k = BlockStore.cidToKey(cid)
    return new Block(await this.store.get(k), cid)
  }

  /**
   * delete removes a block from the store.
   *
   * @param cid The content identifier for an immutable block of data.
   */
  async delete(cid: CID) {
    this.store.delete(BlockStore.cidToKey(cid))
  }

  /**
   * has returns whether the store contains the block associated with the given CID.
   */
  async has(cid: CID) {
    return this.store.has(BlockStore.cidToKey(cid))
  }

  /**
   * putMany adds multiple blocks to the store.
   *
   * @param blocks An iterable of immutable blocks of data.
   */
  async putMany(blocks: Iterable<Block>) {
    const batch = this.store.batch()
    for await (const block of blocks) {
      const k = BlockStore.cidToKey(block.cid)
      if (await this.store.has(k)) {
        continue
      }
      batch.put(k, block.data)
    }
    return await batch.commit()
  }

  /**
   * query searches the store for blocks matching the query parameters.
   *
   * @param query
   */
  async *query(query: Query): AsyncIterable<Result> {
    for await (const result of this.store.query(query)) {
      yield result
    }
  }
}
