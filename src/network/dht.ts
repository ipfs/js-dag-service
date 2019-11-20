import PeerId from 'peer-id'
import CID from 'cids'
import { Peer } from '../core'

export interface Options {
  timeout: number
  maxNumProviders: number
}

/**
 * DhtAPI provides access to the libp2p distributed hash table module.
 */
export class DhtAPI {
  /**
   * @name dht
   * @type DhtAPI
   * @memberof Peer#
   * @param parent {Peer}
   * @description Access to the libp2p host's distributed hash table module.
   */
  constructor(private parent: Peer) {}

  /**
   * Query the DHT for all multiaddresses associated with a `PeerId`.
   *
   * @param peer - The id of the peer to search for.
   */
  async findPeer(id: PeerId | string, options: { maxTimeout?: number } = {}) {
    if (!this.parent.isOnline()) {
      throw new Error('peer is not online')
    }
    if (typeof id === 'string') {
      id = PeerId.createFromB58String(id)
    }
    return this.parent.host.peerRouting.findPeer(id, options)
  }

  /**
   * Find peers in the DHT that can provide a specific value, given a key.
   *
   * @param cid - They cid to find providers for.
   */
  async findProvs(cid: CID | string, options: { maxTimeout?: number; maxNumProviders?: number } = {}) {
    if (!this.parent.isOnline()) {
      throw new Error('peer is not online')
    }
    if (typeof cid === 'string') {
      try {
        cid = new CID(cid)
      } catch (err) {
        throw 'invalid cid'
      }
    }

    return this.parent.host.contentRouting.findProviders(cid, options)
  }

  /**
   * Announce to the network that we are providing given values.
   *
   * @param cids - The CIDs that should be announced.
   * @param options - If recirsive is true, provide not only the given object but also all objects linked from it.
   */
  async provide(cids: CID | CID[], options: { recursive?: boolean } = {}) {
    if (!this.parent.isOnline()) {
      throw new Error('peer is not online')
    }
    if (!Array.isArray(cids)) {
      cids = [cids]
    }
    try {
      cids = cids.map(cid => new CID(cid))
    } catch (err) {
      throw new Error('invalid cid')
    }
    // Ensure blocks are actually local
    const all = await Promise.all(cids.map(cid => this.parent.hasBlock(cid)))
    if (!all.every(has => has)) {
      throw new Error('block(s) not found locally, cannot provide')
    }
    if (options.recursive) {
      // @todo: Implement recursive providing
      throw new Error('not implemented yet')
    } else {
      await Promise.all(cids.map(cid => this.parent.host.contentRouting.provide(cid)))
    }
  }
}
