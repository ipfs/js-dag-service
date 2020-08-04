/* eslint-disable @typescript-eslint/ban-types */
declare module "libp2p-tcp" {
  import Transport, { Connection, Listener } from "interface-transport";
  import Multiaddr from "multiaddr";

  export default class TCP implements Transport {
    dial(ma: Multiaddr, options: any): Connection;
    createListener(options: any, handler?: Function): Listener;
    filter(multiaddrs: Multiaddr[]): Multiaddr[];
  }
}
