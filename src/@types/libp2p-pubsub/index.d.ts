/* eslint-disable @typescript-eslint/ban-types */
declare module "libp2p-pubsub" {
  import Libp2p from "libp2p";
  import PeerId from "peer-id";

  class PubSub {
    constructor(libp2p: Libp2p);
    _processConnection(idB58Str: string, conn: Function, peer: PeerId): any;
    publish(topics: string | string[], messages: any | any[]): Promise<void>;
    subscribe(
      topics: string | string[],
      handler: Function,
      options?: any
    ): Promise<void>;
    unsubscribe(topics: string | string[], handler?: Function): Promise<void>;
    ls(): Promise<void>;
    peers(topic?: string): Promise<string[]>;
    setMaxListeners(n: number): Promise<any>;
    start(): Promise<void>;
    stop(): Promise<void>;
  }

  export default PubSub;
}
