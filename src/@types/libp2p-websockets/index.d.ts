/* eslint-disable @typescript-eslint/ban-types */
declare module "libp2p-websockets" {
  import { Multiaddr } from "multiaddr";
  import Transport from "interface-transport";

  export type Connection = any;
  export type Listener = any;

  class WS implements Transport {
    dial(ma: Multiaddr, options: any): Connection;
    createListener(options: any, handler?: Function): Listener;
    filter(multiaddrs: Multiaddr[]): Multiaddr[];
  }

  export default WS;
}
