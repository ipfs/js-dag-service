import { CID } from "multiformats/basics.js";
import type { Query, Datastore, Pair } from "interface-datastore";
import { Key } from "interface-datastore";

/**
 * Block represents an immutable block of data that is uniquely referenced with a cid.
 *
 * It satisfies the default IPFS IPLD block interface: https://github.com/ipld/js-ipld-block.
 */
export class Block {
  /**
   * Block creates an immutable block of data with the given content identifier (CID).
   *
   * @param {Uint8Array} data The data to be stored in the block as a Uint8Array.
   * @param {CID} cid The content identifier of the data.
   */
  constructor(readonly data: Uint8Array, readonly cid: CID) {}
}

/**
 * BlockStore is a simple key/value store for adding, deleting, and retrieving immutable blocks of data.
 *
 * It satisfies the default IPFS block store interface: https://github.com/ipfs/js-ipfs-repo.
 */
export class BlockStore {
  /**
   * BlockStore creates a new block store.
   *
   * @param {Datastore} store The underlying datastore for locally caching immutable blocks of data.
   */
  constructor(private store: Datastore<Uint8Array>) {}

  /**
   * cidToKey transforms a CID to the appropriate block store key.
   *
   * @param {CID} cid The content identifier for an immutable block of data.
   */
  static cidToKey = (cid: CID): Key => {
    // Compatibility with old CID
    if ((cid as any).bytes) cid.buffer = cid.bytes;
    const wrap = CID.asCID(cid);
    if (!wrap) {
      throw new Error("Not a valid CID");
    }
    // We'll only deal with CID version 1
    return new Key("/" + wrap.toV1().toString(), false);
  };

  /**
   * keyToCid transforms a block store key to a CID.
   *
   * @param {Key} key The key used to encode the CID.
   */
  static keyToCid = (key: Key): CID => {
    return new CID(key.toString().slice(1));
  };

  /**
   * put adds a block to the block store.
   *
   * @param {Block} block An immutable block of data.
   */
  async put(block: Block): Promise<void> {
    const k = BlockStore.cidToKey(block.cid);
    if (await this.store.has(k)) {
      return;
    }
    return this.store.put(k, block.data);
  }

  /**
   * putMany adds multiple blocks to the store.
   *
   * @param {Iterable<Block>} blocks An iterable of immutable blocks of data.
   */
  async putMany(blocks: Iterable<Block>): Promise<void> {
    const batch = this.store.batch();
    for await (const block of blocks) {
      const k = BlockStore.cidToKey(block.cid);
      if (await this.store.has(k)) {
        continue;
      }
      batch.put(k, block.data);
    }
    return await batch.commit();
  }

  /**
   * get returns a block by cid.
   *
   * @param {CID} cid The content identifier for an immutable block of data.
   */
  async get(cid: CID): Promise<Block> {
    const k = BlockStore.cidToKey(cid);
    return new Block(await this.store.get(k), cid);
  }

  /**
   * delete removes a block from the store.
   *
   * @param {CID} cid The content identifier for an immutable block of data.
   */
  async delete(cid: CID): Promise<void> {
    return this.store.delete(BlockStore.cidToKey(cid));
  }

  /**
   * has returns whether the store contains the block associated with the given CID.
   *
   * @param {CID} cid The content identifier for an immutable block of data.
   */
  async has(cid: CID): Promise<boolean> {
    return this.store.has(BlockStore.cidToKey(cid));
  }

  /**
   * query searches the store for blocks matching the query parameters. It returns results from the underlying
   * datastore (i.e., not Blocks).
   *
   * @param {Query} query A set of query options to use when querying the underlying datastore.
   */
  async *query(
    query: Query<Uint8Array>
  ): AsyncIterableIterator<Pair<Uint8Array>> {
    for await (const result of this.store.query(query)) {
      yield result;
    }
  }
}
