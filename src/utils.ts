// @todo: Avoid depending on promisify once libp2p better supports async/await peer-id/-info
import { promisify } from 'es6-promisify'
import Protector from 'libp2p/src/pnet'
import PeerId from 'peer-id'
import PeerInfo from 'peer-info'
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
