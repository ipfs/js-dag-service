declare module 'libp2p-websocket-star-multi' {
  import { Multiaddr } from 'multiaddr'
  import Transport from 'interface-transport'

  export type Connection = any
  export type Listener = any

  class WSStarMulti implements Transport {
    constructor(options?: any)
    dial(ma: Multiaddr, options: any): Connection
    createListener(options: any, handler?: Function): Listener
    filter(multiaddrs: Multiaddr[]): Multiaddr[]
    discovery: any
  }

  // eslint-disable-next-line import/no-default-export
  export default WSStarMulti
}
