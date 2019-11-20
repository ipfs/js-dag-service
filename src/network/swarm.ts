import { Multiaddr } from 'multiaddr'
import PeerId from 'peer-id'
import { Peer } from '../core'

export interface SwarmPeer {
  addr: Multiaddr
  peer: PeerId
  latency?: string
  muxer?: string
  streams?: string[]
  error?: Error
  rawPeerInfo?: object
}

/**
 * SwarmAPI provides access to the libp2p host's peer swarm.
 */
export class SwarmAPI {
  /**
   * @name swarm
   * @type SwarmAPI
   * @memberof Peer#
   * @param parent {Peer}
   * @description Access to the libp2p host's peer swarm.
   */
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

  async connect(addr: Multiaddr) {
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

  async addrs() {
    if (!this.parent.isOnline()) {
      throw new Error('peer is not online')
    }
    const peers = Object.values(this.parent.host.peerBook.getAll())
    return peers
  }
}
