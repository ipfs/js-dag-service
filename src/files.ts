import { CID } from "multiformats/basics.js";
import importer, {
  Options as AddOptions,
  File,
  Result,
} from "ipfs-unixfs-importer";
import exporter, { Options as GetOptions } from "ipfs-unixfs-exporter";
import { Peer } from "./core";
import Ipld from "ipld";

// Export the interfaces for use by callers
export { Options as AddOptions, File, Result } from "ipfs-unixfs-importer";
export { Options as GetOptions } from "ipfs-unixfs-exporter";

// Module augmentation to add methods to Peer from core
declare module "./core" {
  interface Peer {
    addFile(
      source: Iterable<File>,
      options?: AddOptions
    ): Promise<Result | undefined>;
    getFile(
      cid: CID | Uint8Array | string,
      options?: GetOptions
    ): Promise<Uint8Array>;
  }
}

// @todo: Just support this API directly? Required to support the 'Files' style APIs.
const wrap = (ipld: Peer) => {
  // make ipld behave like the block api, some tests need to pull
  // data from ipld so can't use a simple hash
  return {
    put: async (buf: never, { cid }: { cid: CID }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await ipld.put(buf, cid.code ?? (cid as any).codec, {
        cidVersion: cid.version,
      });

      return { cid, data: buf };
    },
    get: async (cid: CID) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const node: any = await ipld.get(cid);
      // Compatibility with old CID
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (cid.code === 112 || (cid as any).codec === "dag-pb") {
        // dag-pb
        return node.serialize();
      }
      return { cid, data: node };
    },
  };
};

/**
 * addFile chunks and adds content to the DAG service.
 *
 * The content is stored as a UnixFS DAG (default for IPFS). It returns the root ipld DAG node.
 *
 * See https://github.com/ipfs/js-ipfs-unixfs-importer for further details.
 * @param source An iterable that yields file objects with `path` and `content` keys.
 * @param options A set of options that control the layout and chunking mechanisms used by the underlying
 * UnixFS library.
 * @example
 * const peer = new Peer(...)
 * await peer.start()
 * const source = [
 *   {
 *     path: 'bar',
 *     content: fs.createReadStream('bar.txt'),
 *   },
 * ]
 * const root = await peer.addFile(source)
 * console.log(root.cid.toString())
 * await peer.stop()
 */
Peer.prototype.addFile = async function (
  source: Iterable<File>,
  options?: AddOptions
) {
  let result: Result | undefined;
  for await (const entry of importer(source, (wrap(this) as unknown) as Ipld, {
    cidVersion: 1,
    codec: "dag-pb",
    ...options,
  })) {
    result = entry;
  }
  return result;
};

/**
 * getFile returns the content of a file as identified by its root CID.
 *
 * The file must have been added as a UnixFS DAG (default for IPFS).
 *
 * @param cid The target content identifier.
 * @example
 * const peer = new Peer(...)
 * await peer.start()
 * const buf = await peer.getFile('bafk...uny')
 * console.log(buf.toString())
 * await peer.stop()
 */
Peer.prototype.getFile = async function (
  cid: CID | Uint8Array | string,
  options?: GetOptions
) {
  const file = await exporter(cid as never, (wrap(this) as unknown) as Ipld);
  // File may not have unixfs prop if small & imported with rawLeaves true
  if (file.unixfs && file.unixfs.type.includes("dir")) {
    throw new Error("this dag node is a directory");
  }
  if (!file.content) {
    throw new Error("this dag node has no content");
  }
  const arrays: Uint8Array[] = [];
  for await (const entry of file.content(options)) {
    if (entry instanceof Uint8Array) {
      arrays.push(entry);
    } else {
      arrays.push(entry.data);
    }
  }
  const flatArray = arrays.reduce<number[]>((acc, curr) => {
    acc.push(...curr);
    return acc;
  }, []);
  return new Uint8Array(flatArray);
};

export { Peer };
