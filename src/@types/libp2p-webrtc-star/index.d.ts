declare module 'libp2p-webrtc-star' {
  import { EventEmitter } from 'events'
  import { Multiaddr } from 'multiaddr'
  import Transport from 'interface-transport'

  export type Connection = any
  export type Listener = any

  class WebRTCStar implements Transport {
    constructor(options?: any)
    dial(ma: Multiaddr, options: any): Promise<Connection>
    createListener(options?: any, handler?: Connection): Listener
    filter(multiaddrs: Multiaddr[]): Multiaddr[]
    discovery: EventEmitter
  }

  // eslint-disable-next-line import/no-default-export
  export default WebRTCStar
}
