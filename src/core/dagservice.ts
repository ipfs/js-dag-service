import { CID } from "multiformats/basics.js";
import { getName } from "multicodec";
import { BlockService } from "./blockservice";
import { Block } from "../utils";

/**
 * AddOptions represents the set of default parameters to use when adding an IPLD Node via the DAG service.
 */
export interface AddOptions {
  /**
   * hashAlg is the hashing algorithm that is used to calculate the CID. The default comes from the given codec.
   */
  hashAlg?: string;
  /**
   * onlyHash controls whether or not the serialized form of the IPLD Node will be passed to the underlying block store.
   */
  onlyHash?: boolean;
  /**
   * cidVersion specifies which version of CID to use. This option is currently ignored (and defaults to v1).
   */
  cidVersion?: number;
}

/**
 * DAGOptions represents the set of parameters to use when initializing a DAG service.
 */
export interface DAGOptions extends AddOptions {
  /**
   * The underlying block service for adding, deleting, and retrieving blocks. It is required.
   */
  blockService: BlockService;
}

/**
 * ResolveResult represents an IPLD Node that was traversed during path resolving.
 */
export interface ResolveResult {
  /**
   * remainderPath is the part of the path that wasn’t resolved yet.
   */
  remainderPath?: string;
  remainder?: string;
  /**
   * value is what the resolved path points to. If further traversing is possible, then `value` is a CID object
   * linking to another IPLD node. If it was possible to fully resolve the path, `value` is the value the path points
   * to. So if you need the CID of the IPLD node you’re currently at, just take the `value` of the previously returned
   * IPLD node.
   */
  value: CID | never;
}

/**
 * DAGService is a content-addressable store for adding, removing, and getting Merkle directed acyclic graphs (DAGs).
 * A DAG service provides an API for creating and resolving IPLD nodes, making it possible for apps and services to
 * integrate with the IPFS IPLD Merkle-forest.
 *
 * It satisfies the default IPLD interface: https://github.com/ipld/js-ipld.
 */
export class DAGService {
  /**
   * A set of default parameters to use when adding an IPLD Node via the DAG service.
   */
  public defaultOptions: AddOptions;
  /**
   * The underlying block service for adding, deleting, and retrieving blocks.
   */
  public blockService: BlockService;

  /**
   * DAGService creates a new directed acyclic graph (DAG) service.
   *
   * @param {DAGOptions} options The set of parameters to use when initializing a DAG service. Must include a `blockService` entry.
   */
  constructor(options: DAGOptions) {
    const { blockService, ...opts } = options;
    this.blockService = blockService;
    this.defaultOptions = opts;
  }

  /**
   * resolve retrieves IPLD nodes along the path that is rooted at a given IPLD node.
   *
   * @param {CID} cid The content identifier at which to start resolving.
   * @param {string} path The path that should be resolved.
   */
  async *resolve(cid: CID, path: string): AsyncIterableIterator<ResolveResult> {
    const data = await this.blockService.get(cid);
    const block = Block.create(data.data, data.cid);
    const reader = block.reader();
    const node = reader.get(path);
    yield {
      value: node.value,
      // @todo: Double check this, what does the spec say?
      remainderPath: node.remainderPath || node.remaining || "",
    };
    if (CID.asCID(node.value)) {
      for await (const res of this.resolve(
        node.value,
        // @todo: Double check this, what does the spec say?
        node.remainderPath || node.remaining || ""
      )) {
        yield res;
      }
    }
  }

  /**
   * tree returns all the paths that can be resolved into.
   *
   * @param {CID} cid The ID to get the paths from
   * @param {string} offsetPath the path to start to retrieve the other paths from.
   * @param {object} options Currently only whether to get the paths recursively or not. If `recursive` is
   * `false`, it will only resolve the paths of the given CID.
   */
  async *tree(
    cid: CID,
    offsetPath = "",
    options = { recursive: false }
  ): AsyncIterableIterator<string> {
    const data = await this.blockService.get(cid);
    const block = Block.create(data.data, data.cid);
    const reader = block.reader();
    // Start with this block and its sub-paths
    for await (let path of reader.tree()) {
      // Return it if it matches the given offset path, but is not the offset path itself
      if (path.startsWith(offsetPath) && path.length > offsetPath.length) {
        if (offsetPath.length > 0) {
          path = path.slice(offsetPath.length + 1);
        }
        yield path;
      }
    }
    // Finish with links if recursive
    if (options.recursive) {
      for await (const [path, sub] of reader.links()) {
        for await (const subPath of this.tree(sub, undefined, options)) {
          let fullPath = `${path}/${subPath}`;
          if (
            fullPath.startsWith(offsetPath) &&
            fullPath.length > offsetPath.length
          ) {
            if (offsetPath.length > 0) {
              fullPath = fullPath.slice(offsetPath.length + 1);
            }
            yield fullPath;
          }
        }
      }
    }
  }

  /**
   * get returns an IPLD node by its content identifier.
   *
   * @param {CID} cid The content identifier for the IPLD node that should be retrieved.
   */
  async get(cid: CID): Promise<unknown> {
    const data = await this.blockService.get(cid);
    const wrap = CID.asCID(data.cid); // Compatibility with old CID
    const block = Block.create(data.data, wrap);
    return block.decode();
  }

  /**
   * getMany returns multiple IPLD nodes from an iterable of content identifiers.
   *
   * @param {Iterable<CID>} cids The content identifiers for the IPLD nodes that should be retrieved.
   */
  async *getMany(cids: Iterable<CID>): AsyncIterableIterator<unknown> {
    for await (const cid of cids) {
      yield this.get(cid);
    }
  }

  /**
   * put encodes and adds an IPLD node using the specified codec.
   *
   * @param {any} node The deserialized IPLD node that should be added. Can be any value, object, Uint8Array, JSON, etc.
   * @param {string | number} codec A string representing the multicodec with which the IPLD node should be encoded.
   * Can also be a numeric multicodec code for compatibility with js-ipld.
   * @param {AddOptions} options The specific parameters to use when encoding the input node.
   */
  async put(
    node: unknown,
    codec: string | number = "dag-cbor",
    options?: AddOptions
  ): Promise<CID> {
    const opts = options || this.defaultOptions || {};
    if (typeof codec === "number") {
      // Compatibility with js-ipld
      codec = getName(codec);
    }
    const block = Block.encoder(node, codec, opts.hashAlg);
    const data = block.encode();
    let cid = await block.cid();
    if (opts.cidVersion === 0) {
      // Compatibility with js-ipld
      cid = cid.toV0();
    }
    if (!opts.onlyHash) {
      await this.blockService.put({ data, cid });
    }
    return cid;
  }

  /**
   * putMany encodes and adds multiple IPLD nodes using the specified codec.
   *
   * @param {Iterable<any>} nodes The deserialized IPLD nodes that should be added.
   * @param {string | number} codec A string representing the multicodec with which the IPLD node should be encoded.
   * Can also be a numeric multicodec code for compatibility with js-ipld.
   * @param {AddOptions} options The specific parameters to use when encoding the input node.
   */
  async *putMany(
    nodes: Iterable<unknown>,
    codec: string | number = "dag-cbor",
    options?: AddOptions
  ): AsyncIterableIterator<CID> {
    const opts = options || this.defaultOptions || {};
    if (typeof codec === "number") {
      codec = getName(codec); // Compatibility with js-ipld
    }
    for await (const node of nodes) {
      yield this.put(node, codec, opts);
    }
  }

  /**
   * remove deletes an IPLD node from the local store.
   *
   * @param {CID} cid The content identifier for the IPLD node to be removed.
   */
  async remove(cid: CID): Promise<CID> {
    const wrap = CID.asCID(cid); // Compatibility with old CID
    return this.blockService.delete(wrap);
  }

  /**
   * removeMany deletes multiple IPLD nodes from the local store.
   *
   * Throws an error if any of the Blocks can’t be removed. This operation is *not* atomic, some nodes might have
   * already been removed.
   *
   * @param {Iterable<CID>} cids The content identifiers for the IPLD nodes to be removed.
   */
  async *removeMany(cids: Iterable<CID>): AsyncIterableIterator<CID> {
    for await (const cid of cids) {
      yield this.remove(cid);
    }
  }
}
