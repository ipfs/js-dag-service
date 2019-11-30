declare module 'multiaddr' {

  type Code = number
  type Size = number

  interface Protocol {
    code: Code
    size: Size
    name: string
    resolvable: boolean
  }

  interface Protocols {
    (proto: string | number): Protocol;

    readonly lengthPrefixedVarSize: number;
    readonly V: number;
    readonly table: Array<[number, number, string]>;
    readonly names: { [index: string]: Protocol };
    readonly codes: { [index: number]: Protocol };

    object(code: Code, size: Size, name: string, resolvable: boolean): Protocol;
  }

  interface Options {
    family: string
    host: string
    transport: string
    port: string
  }

  interface NodeAddress {
    family: string
    address: string
    port: string
  }

  export interface Multiaddr {
    readonly buffer: Buffer;
    toString(): string;
    toOptions(): Options;
    inspect(): string;
    protos(): Protocol[];
    protoCodes(): Code[];
    protoNames(): string[];
    tuples(): Array<[Code, Buffer]>;
    stringTuples(): Array<[Code, string | number]>;
    encapsulate(addr: string | Buffer | Multiaddr): Multiaddr;
    decapsulate(addr: string | Buffer | Multiaddr): Multiaddr;
    getPeerId(): string | undefined;
    equals(other: Multiaddr): boolean;
    nodeAddress(): NodeAddress;
    isThinWaistAddress(addr: Multiaddr): boolean;
    fromStupidString(str: string): never;
  }

  function multiaddr(addr: string | Buffer | Multiaddr): Multiaddr

  namespace multiaddr {
    export type protocols =  Protocols

    export function fromNodeAddress(addr: NodeAddress, transport: string): Multiaddr
    export function isMultiaddr(addr: any): boolean
    export function isName(name: any): boolean
    export function resolve(value: any, cb: (error: Error) => void): void
  }

  // eslint-disable-next-line import/no-default-export
  export default multiaddr
}
