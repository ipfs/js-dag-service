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
  const peerId = await peerIdPromise(hostKey)
  const peerInfo = await peerInfoPromise(peerId)
  
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

// @todo: Avoid depending on promisify once libp2p better supports async/await peer-id/-info
const peerIdPromise = function(hostKey?: Buffer): Promise<PeerId> {
  return new Promise<PeerId>((resolve, reject) => {
    const callback = function(err?: Error, peerid?: PeerId) {
      if (err) {
        reject(err)
      } else {
        resolve(peerid)
      }
    }
    if (hostKey) {
      // @ts-ignore
      PeerId.createFromPrivKey(hostKey, callback)
    } else {
      // @ts-ignore
      PeerId.create({ bits: 2048, keyType: 'rsa' }, callback)
    }
  })
}

const peerInfoPromise = function(peerId: PeerId): Promise<PeerInfo> {
  return new Promise<PeerInfo>((resolve, reject) => {
    // @ts-ignore
    PeerInfo.create(peerId, function(err?: Error, info?: PeerInfo) {
      if (err) {
        reject(err)
      } else {
        resolve(info)
      }
    })
  })
}
