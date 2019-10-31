import Block from '@ipld/block'
// import Codec from '@ipld/codec-interface'
import CID from 'cids'
import { BlockService } from '../blockservice'

/**
 * `Options` represents the set of optional parameters to use when adding an IPLD Node via the DAG service.
 */

export interface Options {
  /**
   * `hashAlg` is the hashing algorithm that is used to calculate the CID. The default comes from the given codec.
   */
  hashAlg?: string
  /**
   * `onlyHash` controls whether or not the serialized form of the IPLD Node will be passed to the underlying block store.
   */
  onlyHash?: boolean
  // formats?: Codec[]
}

/**
 * `ResolveResult` represents an IPLD Node that was traversed during path resolving.
 */
interface ResolveResult {
  /**
   * `remainderPath` is the part of the path that wasn’t resolved yet.
   */
  remaining?: string
  /**
   * `value` is what the resolved path points to. If further traversing is possible, then the value is a CID object
   * linking to another IPLD Node. If it was possible to fully resolve the path, value is the value the path points
   * to. So if you need the CID of the IPLD Node you’re currently at, just take the value of the previously returned
   * IPLD Node.
   */
  value: CID | any
}

/**
 * `DAGService` s a content-addressable store for adding, deleting, and retrieving IPFS Merkle DAGs.
 * A DAG service provides an API for creating and resolving IPLD nodes, making it possible for apps and services to
 * integrate with the IPLD Merkle-forest.
 *
 * @notes
 * Currently we only support CID v1.
 */
export class DAGService {
  /**
   * `constructor` creates a new DAG service.
   * @param blockService The underlying block service for adding, deleting, and retrieving blocks.
   * @param defaults The default set of options to use when creating and retrieving IPLD blocks.
   */
  constructor(public blockService: BlockService, public defaults?: Options) {}
  // @todo: Should we add the ability to add new Codecs? _We_ don't need it, but others might?
  /**
   * `resolve` retrieves IPLD nodes along the path that is rooted at a given IPLD node.
   *
   * @param cid The content identifier at which to start resolving.
   * @param path The path that should be resolved.
   */
  async *resolve(cid: CID, path: string): AsyncIterable<ResolveResult> {
    const data = await this.blockService.get(cid)
    const block = Block.create(data.data, data.cid)
    const reader = block.reader()
    const node = reader.get(path)
    if (node.remaining) {
      for await (const res of this.resolve(node.value, node.remaining)) {
        yield res
      }
    }
    yield node
  }

  /**
   * `tree` returns all the paths that can be resolved into.
   *
   * @param cid The ID to get the paths from
   * @param offsetPath the path to start to retrieve the other paths from.
   * @param options Currently, whether to get the paths recursively or not. `false` resolves only the paths of
   * the given CID.
   */
  async *tree(cid: CID, offsetPath = '', options = { resursive: false }): AsyncIterable<string> {
    const data = await this.blockService.get(cid)
    const block = Block.create(data.data, data.cid)
    const reader = block.reader()
    // Start with links
    if (options.resursive) {
      for await (const [, sub] of reader.links()) {
        for await (const subPath of this.tree(sub, offsetPath, options)) {
          yield subPath
        }
      }
    }
    // Finish with this block and sub-paths
    for await (let path of reader.tree()) {
      // Return it if it matches the given offset path, but is not the offset path itself
      if (path.startsWith(offsetPath) && path.length > offsetPath.length) {
        if (offsetPath.length > 0) {
          path = path.slice(offsetPath.length + 1)
        }
        yield path
      }
    }
  }

  /**
   * `get` returns an IPLD node by its content identifier.
   *
   * @param cid The content identifier for the IPLD node that should be retrieved.
   */
  async get(cid: CID) {
    const data = await this.blockService.get(cid)
    const block = Block.create(data.data, data.cid)
    return block.decode()
  }

  /**
   * `getMany` returns multiple IPLD nodes from an iterable of content identifiers.
   *
   * @param cids The content identifiers for the IPLD nodes that should be retrieved.
   */
  async *getMany(cids: Iterable<CID>): AsyncIterable<any> {
    for await (const cid of cids) {
      yield this.get(cid)
    }
  }

  /**
   * `put` encodes and adds an IPLD node using the specified codec.
   *
   * @param node The deserialized IPLD node that should be added.
   * @param codec A string representing the multicodec with which the IPLD node should be encoded.
   * @param options The specific parameters to use when encoding the input node.
   */
  async put(node: any, codec: string, options?: Options) {
    const block = Block.encoder(node, codec, options && options.hashAlg)
    const data = block.encode()
    const cid = await block.cid()
    if (options && !options.onlyHash) {
      await this.blockService.put({ data, cid })
    }
    return cid
  }

  /**
   * `putMany` encodes and adds multiple IPLD nodes using the specified codec.
   *
   * @param nodes The deserialized IPLD nodes that should be added.
   * @param codec A string representing the multicodec with which the IPLD node should be encoded.
   * @param options The specific parameters to use when encoding the input node.
   */
  async *putMany(nodes: Iterable<any>, codec: string, options?: Options): AsyncIterable<CID> {
    for await (const node of nodes) {
      yield this.put(node, codec, options)
    }
  }

  /**
   * `remove` deletes an IPLD node from the local store.
   *
   * @param cid The content identifier for the IPLD node to be removed.
   */
  async remove(cid: CID) {
    return this.blockService.delete(cid)
  }

  /**
   * `remove` deletes multiple IPLD nodes from the local store.
   *
   * Throws an error if any of the Blocks can’t be removed. This operation is *not* atomic, some nodes might have
   * already been removed.
   *
   * @param cids The content identifiers for the IPLD nodes to be removed.
   */
  async *removeMany(cids: Iterable<CID>): AsyncIterable<CID> {
    for await (const cid of cids) {
      yield this.remove(cid)
    }
  }
}
