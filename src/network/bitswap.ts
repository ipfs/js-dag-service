import PeerId from 'peer-id'
import Big from 'bignumber.js'
import CID from 'cids'
import { Peer } from '../core'

/**
 * Wantlist is an object representing a bitswap wantlist.
 */
export interface Wantlist {
  /**
   * Keys is an array of objects with a '/' key and a string multihash value.
   */
  Keys: Record<'/', string>[]
}

/**
 * Stat is object that contains information about the bitswap agent.
 */
export interface Stat {
  /**
   * provideBufLen
   */
  provideBufLen: number
  /**
   * blocksReceived
   */
  blocksReceived: Big
  /**
   * wantlist
   */
  wantlist: Record<'/', string>[]
  /**
   * peers
   */
  peers: string[]
  /**
   * dupBlksReceived
   */
  dupBlksReceived: Big
  /**
   * dupDataReceived
   */
  dupDataReceived: Big
  /**
   * dataReceived
   */
  dataReceived: Big
  /**
   * blocksSent
   */
  blocksSent: Big
  /**
   * dataSent
   */
  dataSent: Big
}

function formatWantlist(list: Iterable<any>, cidBase?: string) {
  return Array.from(list).map(e => ({ '/': e[1].cid.toBaseEncodedString(cidBase) }))
}

/**
 * BitswapAPI provides access to the libp2p host's bitswap agent.
 * @category Components
 */
export class BitswapAPI {
  /**
   * @name bitswap
   * @type BitswapAPI
   * @memberof Peer#
   * @param parent {Peer}
   * @description Access to the libp2p host's bitswap agent.
   */
  constructor(private parent: Peer) {}

  /**
   * wantlist returns the list of wanted blocks, optionally filtered by peer ID.
   *
   * @param peerId The id of the peer to filter on.
   */
  async wantlist(peerId: PeerId | string): Promise<Wantlist> {
    if (!this.parent.isOnline()) {
      throw new Error('peer is not online')
    }
    let list: Iterable<any>
    if (peerId && typeof peerId === 'string') {
      peerId = PeerId.createFromB58String(peerId)
      list = this.parent.blockExchange.wantlistForPeer(peerId)
    } else {
      list = this.parent.blockExchange.getWantlist()
    }
    return { Keys: formatWantlist(list) }
  }

  /**
   * Show diagnostic information on the bitswap agent.
   * @returns {Promise<Stat>}
   */
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
