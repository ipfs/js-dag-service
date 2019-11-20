// @todo: Avoid depending on promisify once libp2p better supports async/await peer-id/-info
import { promisify } from 'es6-promisify'
import Protector from 'libp2p/src/pnet'
import PeerId from 'peer-id'
import PeerInfo from 'peer-info'
import { Options as Libp2pOptions } from 'libp2p'

import { Node } from './node'

// Export the interfaces for use by callers
export { Options as Libp2pOptions } from 'libp2p'

// Include MemoryDatastore for user convenience
export { MemoryDatastore } from 'interface-datastore'
// Include Buffer for user convenience
const BufferImpl = Buffer
export { BufferImpl as Buffer }

export const setupLibP2PHost = async (
  hostKey?: Buffer,
  secret?: Buffer,
  listenAddrs: string[] = ['/ip4/0.0.0.0/tcp/4005', '/ip4/127.0.0.1/tcp/4006/ws'],
  opts?: Libp2pOptions,
) => {
  const peerId = await (hostKey
    ? promisify<PeerId, Buffer>(PeerId.createFromPrivKey)(hostKey)
    : promisify<PeerId, any>(PeerId.create)({ bits: 2048, keyType: 'rsa' }))
  const peerInfo = await promisify<PeerInfo, PeerId>(PeerInfo.create)(peerId)
  for (const addr of listenAddrs) {
    peerInfo.multiaddrs.add(addr)
  }
  const options: Libp2pOptions = { peerInfo, ...opts }
  if (secret) {
    if (!options.modules) {
      options.modules = {}
    }
    options.modules.connProtector = new Protector(secret)
  }
  return new Node(options)
}
