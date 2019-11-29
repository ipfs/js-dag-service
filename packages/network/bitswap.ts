import PeerId from 'peer-id'
import Big from 'bignumber.js'
import CID from 'cids'
import { Peer } from '@textile/ipfs-lite-core'

export interface Wantlist {
  Keys: Record<'/', string>[]
}

export interface Stat {
  provideBufLen: number
  blocksReceived: Big
  wantlist: { '/': any }[]
  peers: string[]
  dupBlksReceived: Big
  dupDataReceived: Big
  dataReceived: Big
  blocksSent: Big
  dataSent: Big
}

function formatWantlist(list: Iterable<any>, cidBase?: string) {
  return Array.from(list).map(e => ({ '/': e[1].cid.toBaseEncodedString(cidBase) }))
}

export class Bitswap {
  constructor(private parent: Peer) {}

  /**
   *
   * @param peerId - The id of the peer to query on.
   * @note `peer` must be a `PeerId` object, rather than a string as in `js-ipfs`.
   */
  async wantlist(peerId?: PeerId): Promise<Wantlist> {
    if (!this.parent.isOnline()) {
      throw new Error('peer is not online')
    }
    let list: Iterable<any>
    if (peerId) {
      list = this.parent.blockExchange.wantlistForPeer(peerId)
    } else {
      list = this.parent.blockExchange.getWantlist()
    }
    return { Keys: formatWantlist(list) }
  }

  async stat() {
    if (!this.parent.isOnline()) {
      throw new Error('peer is not online')
    }
    const snapshot = this.parent.blockExchange.stat().snapshot
    const stat: Stat = {
      provideBufLen: parseInt(snapshot.providesBufferLength.toString()),
      blocksReceived: new Big(snapshot.blocksReceived),
      wantlist: formatWantlist(this.parent.blockExchange.getWantlist()),
      peers: [...this.parent.blockExchange.peers()].map(id => id.toB58String()),
      dupBlksReceived: new Big(snapshot.dupBlksReceived),
      dupDataReceived: new Big(snapshot.dupDataReceived),
      dataReceived: new Big(snapshot.dataReceived),
      blocksSent: new Big(snapshot.blocksSent),
      dataSent: new Big(snapshot.dataSent),
    }
    return stat
  }

  async unwant(...cids: CID[]): Promise<void> {
    if (!this.parent.isOnline()) {
      throw new Error('peer is not online')
    }
    try {
      cids = cids.map(cid => new CID(cid))
    } catch (err) {
      throw new Error('invalid cid')
    }
    return this.parent.blockExchange.unwant(cids)
  }
}
