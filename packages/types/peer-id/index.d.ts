declare module 'peer-id' {
  import { PrivateKey, PublicKey } from 'libp2p-crypto'

  namespace PeerId {
    type KeyTypes = 'ed25519' | 'rsa' | 'secp256k1';
    type CreateOptions = {
      bits: number,
      keyType: KeyTypes
    };

    type JSON = {
      id: string,
      pubKey: string,
      privKey: string
    };
  }

  class PeerId {
    constructor(id: Buffer, privKey?: PrivateKey, pubKey?: PublicKey);

    static create(optsOrCb: PeerId.CreateOptions): Promise<PeerId>;
    static createFromB58String(str: string): PeerId;
    static createFromBytes(buf: Buffer): PeerId;
    static createFromHexString(str: string): PeerId;
    static createFromJSON(json: JSON): Promise<PeerId>;
    static createFromPubKey(key: Buffer): Promise<PeerId>;
    static createFromPrivKey(key: Buffer): Promise<PeerId>;

    isEqual(other: PeerId | Buffer): boolean;
    toB58String(): string;
    toBytes(): Buffer;
    toHexString(): string;
    toJSON(): PeerId.JSON;
  }

  // eslint-disable-next-line import/no-default-export
  export default PeerId;
}
