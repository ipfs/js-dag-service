declare module 'interface-transport' {
  import { Multiaddr } from 'multiaddr'

  export type Connection = any
  export type Listener = any

  interface Transport {
    dial(ma: Multiaddr, options: any): Connection
    createListener(options: any, handler?: Function): Listener
    filter(multiaddrs: Multiaddr[]): Multiaddr[]
  }

  // eslint-disable-next-line import/no-default-export
  export default Transport
}
