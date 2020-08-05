declare module "multiformats/bases/base58.js";
declare module "multiformats/basics.js" {
  export class CID {
    constructor(version: 0 | 1, code: number | string, multhash: Uint8Array);
    constructor(cid: CID, ...args: any[]);
    constructor(str: string, ...args: any[]);
    constructor(buf: Uint8Array, ...args: any[]);
    readonly version: number;
    readonly code: number;
    readonly multihash: Uint8Array;
    readonly buffer: Uint8Array;
    toV0(): CID;
    toV1(): CID;
    toString(base?: string): string;
    toJSON(): { code: number; version: 0 | 1; hash: Uint8Array };
    equals(other: any): boolean;
    [Symbol.toStringTag]: "CID";
    [cidSymbol]: true;
    static asCID(value: any): CID;
  }
  export const multicodec = any;
  export const multibase = any;
  export const multihash = any;
}
declare module "@ipld/dag-cbor";
declare module "@ipld/dag-json";
declare module "@ipld/block";
declare module "multiformats/legacy";
