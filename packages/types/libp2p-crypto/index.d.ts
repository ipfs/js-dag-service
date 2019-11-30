declare module 'libp2p-crypto' {

  export type KeyTypes = 'ed25519' | 'rsa' | 'secp256k1'
  // @todo: Export the specific key types as well
  export interface PublicKey {
    verify(data: any, sig: any): Promise<any>
    marshal(): Buffer
    readonly bytes: Buffer
    equal(key: PublicKey): boolean
    hash(): Promise<Buffer>
  }
  export interface PrivateKey {
    sign(data: any): Promise<Buffer>
    readonly public: PublicKey
    marshal(): Buffer
    readonly bytes: Buffer
    equal(key: PublicKey): boolean
    hash(): Promise<Buffer>
    id(): Promise<string>
  }

  export interface Keypair {
    privateKey: PrivateKey
    publicKey: PublicKey
  }

  export interface Cipher {
    encrypt(data: Buffer): Promise<Buffer>
    decrypt(data: Buffer): Promise<Buffer>
  }

  export namespace aes {
    export function create(key: Buffer, iv: Buffer): Promise<Cipher>
  }

  export namespace hmac {
    export function create(hash: string, secret: Buffer): Promise<(data: Buffer) => Buffer>
  }

  export namespace keys {
    export function generateKeyPair(type: KeyTypes, bits: number): Promise<Keypair>
    export function generateKeyPairFromSeed(type: KeyTypes, seed: Uint32Array, bits: number): Promise<Keypair>
    export function generateEphemeralKeyPair(curve: 'P-256' | 'P-384' | 'P-521'): Promise<{ key: Buffer, genSharedKey: Function }>
    export function unmarshalPublicKey(buf: Buffer): Promise<PublicKey>
    export function marshalPublicKey(key: Buffer, type: string): Buffer
    export function unmarshalPrivateKey(buf: Buffer): Promise<PrivateKey>
    export function marshalPrivateKey(key: Buffer, type: string): Buffer
  }

  export function randomBytes(len: number): Buffer
  export function pbkdf2(password: string | Buffer, salt: string | Buffer, iterations: number, keySize: number, hash: string): Buffer
}
