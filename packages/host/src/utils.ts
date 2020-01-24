import Multiaddr from 'multiaddr'
/* eslint-disable @typescript-eslint/no-var-requires */

const Protector = require('libp2p/src/pnet')
const PeerId = require('peer-id')
const PeerInfo = require('peer-info')

type PeerId = any
type PeerInfo = any
type PeerBook = any

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
      PeerId.createFromPrivKey(hostKey, callback)
    } else {
      PeerId.create({ bits: 2048, keyType: 'rsa' }, callback)
    }
  })
}

export function creator(Node: any) {
  return async function createHost(
    hostKey?: Buffer,
    secret?: Buffer,
    listenAddrs: string[] = ['/ip4/0.0.0.0/tcp/4005', '/ip4/127.0.0.1/tcp/4006/ws'],
    opts?: Options,
  ) {
    const peerId = await peerIdPromise(hostKey)
    const peerInfo = new PeerInfo(peerId)

    for (const addr of listenAddrs) {
      peerInfo.multiaddrs.add(addr)
    }
    const options: Options = { peerInfo, ...opts }
    if (secret) {
      if (!options.modules) {
        options.modules = {}
      }
      options.modules.connProtector = new Protector(secret)
    }
    return new Node(options)
  }
}

export interface OptionsConfig {
  contentRouting?: {}
  dht?: {
    kBucketSize?: number
    enabled?: boolean
    randomWalk?: {
      enabled?: boolean
    }
  }
  peerDiscovery?: {
    autoDial?: boolean
    enabled?: boolean
    bootstrap?: {
      interval?: number
      enabled?: boolean
      list?: Multiaddr[]
    }
    mdns?: {
      interval?: number
      enabled?: boolean
    }
    webRTCStar?: {
      interval?: number
      enabled?: boolean
    }
    websocketStar?: {
      enabled?: boolean
    }
  }
  peerRouting?: {}
  pubsub?: {
    enabled?: boolean
    emitSelf?: boolean
    signMessages?: boolean
    strictSigning?: boolean
  }
  relay?: {
    enabled?: boolean
    hop?: {
      enabled?: boolean
      active?: boolean
    }
  }
}

export interface OptionsModules {
  connEncryption?: Array<any>
  streamMuxer?: Array<any>
  dht?: any
  peerDiscovery?: Array<any>
  transport?: any[]
  pubsub?: any
  connProtector?: any
}

export interface OptionsSwitch {
  denyTTL?: number
  denyAttempts?: number
  maxParallelDials?: number
  maxColdCalls?: number
  dialTimeout?: number
}

export interface Options {
  modules?: OptionsModules
  peerInfo: PeerInfo
  peerBook?: PeerBook
  switch?: OptionsSwitch
  config?: OptionsConfig
}
