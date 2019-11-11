declare module 'libp2p' {
  import PeerInfo from 'peer-info'
  import PeerBook from 'peer-book'
  import PeerId from 'peer-id'
  import { Multiaddr } from 'multiaddr'
  import LibP2pBootstrap from 'libp2p-bootstrap'
  import LibP2pKadDht from 'libp2p-kad-dht'
  import CID from 'cids'

  export interface OptionsConfig {
    contentRouting?: {},
    dht?: {
      kBucketSize?: number
      enabled?: boolean,
      randomWalk?: {
        enabled?: boolean
      }
    },
    peerDiscovery?: {
      autoDial?: boolean,
      enabled?: boolean,
      bootstrap?: {
        interval?: number
        enabled?: boolean
        list?: Multiaddr[]
      },
      mdns?: {
        interval?: number
        enabled?: boolean
      },
      webRTCStar?: {
        interval?: number
        enabled?: boolean
      },
      websocketStar?: {
        enabled?: boolean
      }
    },
    peerRouting?: {},
    pubsub?: {
      enabled?: boolean,
      emitSelf?: boolean,
      signMessages?: boolean,
      strictSigning?: boolean
    },
    relay?: {
      enabled?: boolean,
      hop?: {
        enabled?: boolean,
        active?: boolean
      }
    }
  }

  export interface OptionsModules {
    connEncryption?: Array<any>,
    streamMuxer?: Array<any>,
    dht?: typeof LibP2pKadDht,
    peerDiscovery?: Array<typeof LibP2pBootstrap>,
    transport?: any[],
    pubsub?: any,
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

  export type Events = 'peer:connect' | 'peer:disconnect' | 'peer:discovery' | 'start' | 'stop';

  interface Connection {
    getPeerInfo (cb: (error: Error | null, peerInfo?: PeerInfo) => any): void;
  }

  interface PeerRouting {
    findPeer(id: PeerId, options?: { maxTimeout?: number }): Promise<any>
  }

  interface ContentRouting {
    findProviders(cid: CID, options?: { maxTimeout?: number, maxNumProviders?: number }): Promise<any>
    provide(cid: CID): Promise<void>
  }

  class LibP2p {
    readonly _dht: LibP2pKadDht;

    constructor(options: Options);

    readonly peerInfo: PeerInfo
    readonly peerBook: PeerBook
    readonly peerRouting: PeerRouting
    readonly contentRouting: ContentRouting

    dial(peerInfo: PeerInfo | PeerId | Multiaddr | string): Promise<Connection>
    dialProtocol(peerInfo: PeerInfo | Multiaddr, protocol: string): Promise<Connection>
    dialFSM (peer: PeerInfo | PeerId | Multiaddr | string, protocol: string): Promise<Connection>
    hangUp(peerInfo: PeerInfo): Promise<void>
    handle(protocol: string, handler: (protocol: string, conn: Connection) => any, matcher?: (protocol: string, requestedProtocol: string, cb: (error: Error | null, accept: boolean) => void) => any): void
    unhandle(protocol: string): void
    isStarted(): boolean
    on(event: Events, cb: (event: any) => any): this
    once(event: Events, cb: (event: any) => any): this
    removeListener(event: Events, cb: (event: any) => any): this
    ping(peerInfo: PeerInfo): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
  }

  // eslint-disable-next-line import/no-default-export
  export default LibP2p;
}

declare module 'libp2p/src/pnet' {
  type Connection = any

  class Protector {
    constructor(keyBuffer: Buffer)
    protect (connection: Connection, callback: Function): Connection
  }
  // eslint-disable-next-line import/no-default-export
  export default Protector
}
