import CID from "cids";
import * as dagpb from "@ipld/dag-pb";
import _Block from "@ipld/block/defaults";
import { base58btc, base58flickr } from "multiformats/bases/base58";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
_Block.multiformats.multibase.add([base58btc, base58flickr]);
_Block.multiformats.multicodec.add(dagpb);

// Basic constructor interface
interface Constructor<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (parent: any): T;
}

/**
 * Magic function to lazily define child classes as namespaces on parent classes in a type-safe way.
 *
 * @param obj The object to which to add the subclass.
 * @param name The name of the property that subclass will be available under.
 * @param ctor The actual subclass to add.
 * @protected
 * @ignore
 */
export function addSubclass<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
  obj: any,
  name: string,
  ctor: Constructor<T>
): void {
  Object.defineProperty(obj.prototype, name, {
    // Properties should show up during enumeration of properties on Peer
    enumerable: true,
    get: function () {
      // One-time lazily 'get' a new Bitswap and then cache it for subsequent calls
      const value = new ctor(this);
      // Now set the 'cached' value 'permanently'
      Object.defineProperty(this, name, {
        value: value,
        configurable: false,
        writable: false,
        enumerable: true,
      });
      return value;
    },
  });
}

export type Codec = never;

export interface Reader<T> {
  get(path: string): { value: T; remainderPath?: string; remaining?: string };
  links(): IterableIterator<[string, CID]>;
  tree(): IterableIterator<string>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Options<T = any> {
  source?: T;
  data?: Uint8Array;
  codec?: string;
  cid?: CID | string;
  algo?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Block<T = any> {
  opts: Options<T>;
  readonly codec: string;
  source(): T | null;
  cid(): Promise<CID>;
  validate(): boolean;
  encode(): Uint8Array;
  encodeUnsafe(): Uint8Array;
  decode(): T;
  decodeUnsafe(): T;
  reader(): Reader<T>;
}

export interface BlockConstructor {
  new <T>(opts: Options<T>): Block<T>;
  getCodec(codec: string): Codec;
  encoder<T>(source: T, codec: string, algorithm?: string): Block<T>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  decoder<T = any>(
    data: Uint8Array,
    codec: string,
    algorithm?: string
  ): Block<T>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create<T = any>(data: Uint8Array, cid: CID): Block<T>;
}

export const Block: BlockConstructor = _Block;
