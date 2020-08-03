/* eslint-disable @typescript-eslint/ban-types */
declare module "libp2p-gossipsub" {
  import Libp2p from "libp2p";
  import PeerInfo from "peer-info";
  import PubSub from "libp2p-pubsub";

  class Heartbeat {
    constructor(gossippub: GossipSub);
    start(callback: Function): void;
    stop(callback: Function): void;
  }

  interface CacheEntry {
    msgID: string;
    topics: string[];
  }

  class MessageCache {
    constructor(gossip: number, history: number);
    msgs: Map<string, any>;
    history: Array<Array<CacheEntry>>;
    put(msg: any): void;
    get(msgID: string): string[];
    getGossipIDs(topic: string): string[];
    shift(): void;
  }

  class GossipSub extends PubSub {
    constructor(
      libp2p: Libp2p,
      options?: { fallbackToFloodsub?: boolean; emitSelf?: boolean }
    );
    mesh: Map<string, Set<PeerInfo>>;
    fanout: Map<string, Set<PeerInfo>>;
    lastpub: Map<string, number>;
    gossip: Map<PeerInfo, Array<any>>;
    control: Map<PeerInfo, any>;
    messageCache: MessageCache;
    heartbeat: Heartbeat;
    start(callback?: Function): Promise<void>;
    stop(callback?: Function): Promise<void>;
    join(...topics: string[]): Promise<void>;
    leave(...topics: string[]): Promise<void>;
  }
  export default GossipSub;
}
