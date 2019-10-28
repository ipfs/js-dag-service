declare namespace LibP2pCrypto {
  type KeyTypes = 'ed25519' | 'rsa' | 'secp256k1';

  interface PublicKey {
    hash(cb: (error: Error | null, hash: Buffer) => void): void;
  }

  interface PrivateKey {
    readonly public: PublicKey;

    hash(cb: (error: Error | null, hash: Buffer) => void): void;
    id(cb: (error: Error | null, id: string) => void): void
  }

  interface KeyExports {
    generateKeyPair(bits: number, cb: (error: Error | null, privKey: PrivateKey) => void): void;
  }

  interface Keys {
    generateKeyPair(type: KeyTypes, bits: number, cb: (error: Error | null, privKey: PrivateKey) => void): void;

    readonly supportedKeys: {
      readonly [key in keyof KeyTypes]: KeyExports
    };
  }

  interface Cipher {
    encrypt(data: Buffer, cb: (err?: Error, data?: Buffer) => void): void;
    decrypt(data: Buffer, cb: (err?: Error, data?: Buffer) => void): void;
  }

  interface AES {
    create(key: Buffer, iv: Buffer, cb: (err?: Error, cipher?: Cipher) => void): void;
  }

  interface Crypto {
    readonly keys: Keys,
    readonly aes: AES
  }
}

declare module 'libp2p-crypto' {
  const crypto: LibP2pCrypto.Crypto;

  // eslint-disable-next-line import/no-default-export
  export default crypto;
}
