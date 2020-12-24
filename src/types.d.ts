declare module "interface-connection" {}
declare module "libp2p-tcp" {}
declare module "libp2p-mdns" {}
declare module "libp2p-websockets" {}
declare module "libp2p-kad-dht" {}
declare module "libp2p-mplex" {}
declare module "libp2p-secio" {}
declare module "libp2p-bootstrap" {}
declare module "libp2p-webrtc-star" {}
declare module "ipfs-bitswap" {
  declare class Bitswap {
    constructor(...args: any[]);
  }
  export default Bitswap;
}
declare module "ipfs-repo" {}
declare module "ipfs-unixfs-importer" {}
declare module "ipfs-unixfs-exporter" {}
declare module "multihashing-async" {
  declare const fun: (...args: any[]) => Promise<any>;
  export default fun;
}
declare module "@ipld/dag-pb" {
  export function prepare(...args: any[]): any;
  export function encode(...args: any[]): any;
  export const code: any;
}
declare module "@ipld/dag-cbor" {}
declare module "@ipld/dag-json" {}
declare module "@ipld/block" {}
declare module "@ipld/block/defaults" {
  export default any;
}
