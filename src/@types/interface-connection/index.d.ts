declare module "interface-connection" {
  import PeerInfo from "peer-info";

  export default interface Connection {
    getPeerInfo(cb: (error: Error | null, peerInfo?: PeerInfo) => any): void;
  }
}
