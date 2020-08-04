/* eslint-disable @typescript-eslint/ban-types */
declare module "libp2p" {
  import PeerBook from "peer-book";
  import PeerId from "peer-id";
  import Multiaddr from "multiaddr";
  import CID from "cids";
  import GossipPub from "libp2p-gossipsub";
  import { EventEmitter } from "events";

  export interface OptionsConfig {
    contentRouting?: {};
    dht?: {
      kBucketSize?: number;
      enabled?: boolean;
      randomWalk?: {
        enabled?: boolean;
      };
      clientMode?: boolean;
    };
    peerDiscovery?: {
      autoDial?: boolean;
      enabled?: boolean;
      bootstrap?: {
        interval?: number;
        enabled?: boolean;
        list?: Multiaddr[] | string[];
      };
      mdns?: {
        interval?: number;
        enabled?: boolean;
      };
      webRTCStar?: {
        interval?: number;
        enabled?: boolean;
      };
      websocketStar?: {
        enabled?: boolean;
      };
    };
    peerRouting?: {};
    pubsub?: {
      enabled?: boolean;
      emitSelf?: boolean;
      signMessages?: boolean;
      strictSigning?: boolean;
    };
    relay?: {
      enabled?: boolean;
      hop?: {
        enabled?: boolean;
        active?: boolean;
      };
    };
  }

  export interface Options {
    dialer?: {
      maxParallelDials: number;
      maxDialsPerPeer: number;
      dialTimeout: number;
    };
    modules?: {
      connEncryption?: Array<any>;
      streamMuxer?: Array<any>;
      dht?: any;
      peerDiscovery?: Array<any>;
      transport?: any[];
      pubsub?: any;
      connProtector?: any;
    };
    peerId: PeerId;
    peerBook?: PeerBook;
    switch?: {
      denyTTL?: number;
      denyAttempts?: number;
      maxParallelDials?: number;
      maxColdCalls?: number;
      dialTimeout?: number;
    };
    config?: OptionsConfig;
    addresses?: any;
    metrics?: { enabled?: boolean };
    peerStore?: {
      persistence?: boolean;
      threshold?: number;
    };
  }

  export type Events =
    | "peer:connect"
    | "peer:disconnect"
    | "peer:discovery"
    | "start"
    | "stop";

  export interface PeerRouting {
    findPeer(id: PeerId, options?: { maxTimeout?: number }): Promise<any>;
  }

  interface ContentRouting {
    findProviders(
      cid: CID,
      options?: { maxTimeout?: number; maxNumProviders?: number }
    ): Promise<any>;
    provide(cid: CID): Promise<void>;
  }

  export interface Connection {
    id: string;
    localAddr: Multiaddr;
    remoteAddr: Multiaddr;
    localPeer: PeerId;
    remotePeer: PeerId;
    newStream(
      protocols: string[]
    ): Promise<{ stream: Duplex; protocol: string }>;
    addStream(
      muxedStream: Duplex,
      meta: { protocol: string; metadata: any }
    ): void;
    removeStream(id: string): void;
    close(): Promise<void>;
    readonly streams: Array<Duplex>;
    readonly registry: Map<string, Duplex>;
    readonly stat: {
      status: "open" | "closing" | "closed";
      timeline: { open: Date; upgraded: Date; close: Date };
      direction: "inbound" | "outbound";
      multiplexer: string;
      encryption: string;
      tags: string[];
    };
  }

  class LibP2P extends EventEmitter {
    constructor(options: Options);
    /**
     * Starts the libp2p node and all its subsystems
     */
    start(): Promise<void>;
    /**
     * Stop the libp2p node by closing its listeners and open connections
     */
    stop(): Promise<void>;
    /**
     * Whether the host has been started.
     */
    isStarted(): boolean;
    /**
     * Load keychain keys from the datastore.
     * Imports the private key as 'self', if needed.
     */
    loadKeychain(): Promise<void>;
    /**
     * Gets a Map of the current connections. The keys are the stringified
     * `PeerId` of the peer. The value is an array of Connections to that peer.
     */
    readonly connections: Map<string, Connection[]>;
    /**
     * Dials to the provided peer. If successful, the known metadata of the
     * peer will be added to the nodes `peerStore`
     */
    dial(
      peerInfo: PeerId | Multiaddr | string,
      options?: { signal: AbortSignal }
    ): Promise<Connection>;
    /**
     * Dials to the provided peer and handshakes with the given protocol.
     * If successful, the known metadata of the peer will be added to the nodes `peerStore`,
     * and the `Connection` will be returned
     */
    dialProtocol(
      peerInfo: PeerId | Multiaddr | string,
      protocols: string[] | string,
      options?: { signal: AbortSignal }
    ): Promise<Connection>;
    /**
     * Get peer advertising multiaddrs by concating the addresses used
     * by transports to listen with the announce addresses.
     * Duplicated addresses and noAnnounce addresses are filtered out.
     */
    readonly multiaddrs: Array<Multiaddr>;
    /**
     * Disconnects all connections to the given `peer`
     */
    hangUp(peerInfo: PeerId | Multiaddr | string): Promise<void>;
    /**
     * Pings the given peer in order to obtain the operation latency.
     */
    ping(peerInfo: PeerId | Multiaddr | string): Promise<void>;
    /**
     * Registers the `handler` for each protocol
     */
    handle(
      protocols: string[] | string,
      handler: (param: {
        connection: Connection;
        stream: Duplex;
        protocol: string;
      }) => void
    ): void;
    /**
     * Removes the handler for each protocol. The protocol
     * will no longer be supported on streams.
     */
    unhandle(protocols: string[] | string): void;

    readonly peerId: PeerId;
    readonly peerBook: PeerBook;
    readonly peerStore: any;
    readonly peerRouting: PeerRouting;
    readonly contentRouting: ContentRouting;
    readonly pubsub?: GossipPub;

    dialFSM(
      peer: PeerInfo | PeerId | Multiaddr | string,
      protocol: string
    ): Promise<Connection>;

    static create(options: Partial<Options>): Promise<LibP2P>;
  }
  export default LibP2P;
}

declare module "libp2p/src/pnet" {
  type Connection = any;

  class Protector {
    constructor(keyBuffer: Buffer);
    protect(connection: Connection, callback: Function): Connection;
  }
  export default Protector;
}
