declare module 'libp2p-spdy' {
  export type Muxer = any

  class LibP2pSpdy implements Muxer {
    constructor(conn: any, isListener: boolean)

    dialer (conn: any): Muxer
    listener (conn: any): Muxer

    muticodec: string
  }

  // eslint-disable-next-line import/no-default-export
  export default LibP2pSpdy
}
