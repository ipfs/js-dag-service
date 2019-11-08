// @todo: Avoid depending on promisify once libp2p better supports async/await peer-id/-info
import { promisify } from 'es6-promisify'
import Protector from 'libp2p/src/pnet'
import PeerId from 'peer-id'
import PeerInfo from 'peer-info'
import Ipld from 'ipld'
import CID from 'cids'
import importer, { Options as AddOptions, File, Result } from 'ipfs-unixfs-importer'
import exporter, { Options as GetOptions } from 'ipfs-unixfs-exporter'

import { Node } from './bundle'

export const setupLibP2PHost = async (
  hostKey?: Buffer,
  secret?: Buffer,
  listenAddrs: string[] = ['/ip4/0.0.0.0/tcp/4005', '/ip4/127.0.0.1/tcp/4006/ws'],
  opts: any = {},
) => {
  const peerId = await (hostKey
    ? promisify<PeerId, Buffer>(PeerId.createFromPrivKey)(hostKey)
    : promisify<PeerId, any>(PeerId.create)({ bits: 2048, keyType: 'rsa' }))
  const peerInfo = await promisify<PeerInfo, PeerId>(PeerInfo.create)(peerId)
  for (const addr of listenAddrs) {
    peerInfo.multiaddrs.add(addr)
  }
  const options = { peerInfo, ...opts }
  if (secret) {
    if (!options.modules) {
      options.modules = {}
    }
    options.modules.connProtector = new Protector(secret)
  }
  return new Node(options)
}

export { Options as AddOptions, File, Result } from 'ipfs-unixfs-importer'

export async function addFile(source: Iterable<File>, ipld: Ipld, options?: AddOptions) {
  let result: Result | undefined
  for await (const entry of importer(source, ipld, { cidVersion: 1, codec: 'dag-pb', ...options })) {
    result = entry
  }
  return result
}

export { Options as GetOptions } from 'ipfs-unixfs-exporter'

export async function getFile(cid: CID | Buffer | string, ipld: Ipld, options?: GetOptions) {
  const file = await exporter(cid, ipld)
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
