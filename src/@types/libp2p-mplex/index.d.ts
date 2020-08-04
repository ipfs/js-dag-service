declare module "libp2p-mplex" {
  type Muxer = any;

  class LibP2pMplex {
    constructor(conn: any, isListener: boolean);

    dialer(conn: any): Muxer;
    listener(conn: any): Muxer;

    muticodec: string;
  }

  export default LibP2pMplex;
}
