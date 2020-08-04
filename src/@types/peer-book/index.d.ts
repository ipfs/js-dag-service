declare module "peer-book" {
  import PeerInfo from "peer-info";
  import PeerId from "peer-id";

  class PeerBook {
    constructor();

    get(peer: PeerId | PeerInfo | string): PeerInfo;
    getAll(): { [peerId: string]: PeerInfo };
    getAllArray(): PeerInfo[];
    getMultiaddrs(peer: PeerId | PeerInfo | string): string[];
    has(peer: PeerId | PeerInfo | string): boolean;
    put(peerInfo: PeerInfo, replace?: boolean): PeerInfo;
    remove(peerInfo: PeerInfo, replace?: boolean): void;
  }
  export default PeerBook;
}
