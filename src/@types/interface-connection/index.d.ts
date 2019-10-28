declare module 'interface-connection' {
  import PeerInfo from "peer-info"

  // eslint-disable-next-line import/no-default-export
  export default interface Connection {
    getPeerInfo (cb: (error: Error | null, peerInfo?: PeerInfo) => any): void;
  }
}
