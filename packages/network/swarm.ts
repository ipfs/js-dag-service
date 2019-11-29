import { Multiaddr } from 'multiaddr'
import PeerId from 'peer-id'
import PeerInfo from 'peer-info'
import { Peer } from '@textile/ipfs-lite-core'
import { Connection } from 'libp2p'

export interface SwarmPeer {
  addr: Multiaddr
  peer: PeerId
  latency?: string
  muxer?: string
  streams?: string[]
  error?: Error
  rawPeerInfo?: object
}

export class Swarm {
  constructor(private parent: Peer) {}

  async peers(options: { verbose?: boolean } = {}) {
    if (!this.parent.isOnline()) {
      throw new Error('peer is not online')
    }
    const peers: SwarmPeer[] = []
    Object.values(this.parent.host.peerBook.getAll()).forEach(peer => {
      const connectedAddr = peer.isConnected()
      if (!connectedAddr) {
        return
      }
      const tupple: SwarmPeer = {
        addr: connectedAddr,
        peer: peer.id,
      }
      if (options.verbose) {
        tupple.latency = 'n/a'
      }
      peers.push(tupple)
    })
    return peers
  }

  async connect(addr: Multiaddr): Promise<Connection> {
    if (!this.parent.isOnline()) {
      throw new Error('peer is not online')
    }
    return this.parent.host.dial(addr)
  }

  async disconnect(addr: Multiaddr) {
    if (!this.parent.isOnline()) {
      throw new Error('peer is not online')
    }
    return this.parent.host.hangUp(addr)
  }

  async localAddrs() {
    if (!this.parent.isOnline()) {
      throw new Error('peer is not online')
    }
    return this.parent.host.peerInfo.multiaddrs.toArray()
  }

  async addrs(): Promise<Array<PeerInfo>> {
    if (!this.parent.isOnline()) {
      throw new Error('peer is not online')
    }
    const peers = Object.values(this.parent.host.peerBook.getAll())
    return peers
  }
}
