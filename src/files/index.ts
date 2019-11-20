import CID from 'cids'
import importer, { Options as AddOptions, File, Result } from 'ipfs-unixfs-importer'
import exporter, { Options as GetOptions } from 'ipfs-unixfs-exporter'
import { Peer } from '../core'

// Export the interfaces for use by callers
export { Options as AddOptions, File, Result } from 'ipfs-unixfs-importer'
export { Options as GetOptions } from 'ipfs-unixfs-exporter'

// Module augmentation to add methods to Peer from core
declare module '../core' {
  interface Peer {
    addFile(source: Iterable<File>, options?: AddOptions): Promise<Result | undefined>
    getFile(cid: CID | Buffer | string, options?: GetOptions): Promise<Buffer>
  }
}

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
Peer.prototype.addFile = async function(source: Iterable<File>, options?: AddOptions) {
  let result: Result | undefined
  for await (const entry of importer(source, this, { cidVersion: 1, codec: 'dag-pb', ...options })) {
    result = entry
  }
  return result
}

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
Peer.prototype.getFile = async function(cid: CID | Buffer | string, options?: GetOptions) {
  const file = await exporter(cid, this)
  // File may not have unixfs prop if small & imported with rawLeaves true
  if (file.unixfs && file.unixfs.type.includes('dir')) {
    throw new Error('this dag node is a directory')
  }
  if (!file.content) {
    throw new Error('this dag node has no content')
  }
  const arr: Buffer[] = []
  for await (const entry of file.content(options)) {
    arr.push(entry as Buffer)
  }
  return Buffer.concat(arr)
}

export { Peer }
