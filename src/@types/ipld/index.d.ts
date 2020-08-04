/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

declare module "ipld" {
  import BlockService from "ipfs-block-service";
  import CID from "cids";

  interface Options {
    blockService: BlockService;
    formats?: Function[];
    loadFormat?: Function;
  }

  interface AddOptions {
    hashAlg?: string;
    cidVersion?: number;
    onlyHash?: boolean;
  }

  class Ipld {
    constructor(opts: {});
    put(node: object, format: number, options?: AddOptions): Promise<CID>;
    putMany(
      nodes: Iterable<object>,
      format: number,
      options?: AddOptions
    ): AsyncIterable<CID>;
    resolve(
      cid: CID,
      path: string
    ): AsyncIterable<{ remainderPath?: string; value: any }>;
    get(cid: CID): Promise<any>;
    getMany(cids: Iterable<CID>): AsyncIterable<any>;
    remove(cid: CID): Promise<CID>;
    removeMany(cids: Iterable<CID>): AsyncIterable<CID>;
    tree(
      cid: CID,
      path?: string,
      options?: { recursive: boolean }
    ): AsyncIterable<string>;
    addFormat?(ipldFormatImplementation: Function): Ipld;
    removeFormat?(codec: any): Ipld;
    defaultOptions?: AddOptions;
  }
  export default Ipld;
}
