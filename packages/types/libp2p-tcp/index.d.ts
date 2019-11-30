/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable import/no-default-export */
declare module 'libp2p-tcp' {
  import Transport , { Connection, Listener } from 'interface-transport'
  import { Multiaddr } from 'multiaddr'

  export default class TCP implements Transport {
    dial(ma: Multiaddr, options: any): Connection
    createListener(options: any, handler?: Function): Listener
    filter(multiaddrs: Multiaddr[]): Multiaddr[]
  }
}
