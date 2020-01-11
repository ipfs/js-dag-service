declare module 'libp2p-crypto' {

  /**
   * Supported key types.
   * Currently the 'RSA' and 'ed25519' types are supported, although ed25519 keys
   * support only signing and verification of messages. For encryption / decryption
   * support, RSA keys should be used.
   * Installing the libp2p-crypto-secp256k1 module adds support for the 'secp256k1'
   * type, which supports ECDSA signatures using the secp256k1 elliptic curve
   * popularized by Bitcoin. This module is not installed by default, and should be
   * explicitly depended on if your project requires secp256k1 support.
   */
  export type KeyType = 'ed25519' | 'rsa' | 'secp256k1'

  /**
   * Maps an IPFS hash name to its node-forge equivalent.
   * See https://github.com/multiformats/multihash/blob/master/hashtable.csv
   */
  export type HashType = 'sha1' | 'sha2-256' | 'sha2-512'

  export type CurveType = 'P-256' | 'P-384' | 'P-521'

  export namespace aes {
    interface Cipher {
      encrypt(data: Buffer): Promise<Buffer>;
      decrypt(data: Buffer): Promise<Buffer>;
    }
    /**
     * Exposes an interface to AES encryption (formerly Rijndael),
     * as defined in U.S. Federal Information Processing Standards Publication 197.
     * This uses CTR mode.
     * @param key The key, if length 16 then AES 128 is used. For length 32, AES 256 is used.
     * @param iv Must have length 16.
     */
    export function create(key: Buffer, iv: Buffer): Promise<Cipher>;
  }

  export namespace hmac {
    interface Digest {
      digest(data: Buffer): Promise<Buffer>;
      length: 20 | 32 | 64 | number;
    }
    /**
     * Exposes an interface to the Keyed-Hash Message Authentication Code (HMAC)
     * as defined in U.S. Federal Information Processing Standards Publication 198.
     * An HMAC is a cryptographic hash that uses a key to sign a message.
     * The receiver verifies the hash by recomputing it using the same key.
     * @param hash
     * @param secret
     */
    export function create(hash: 'SHA1' | 'SHA256' | 'SHA512' | string, secret: Buffer): Promise<Digest>;
  }

  /**
   * Generic public key interface.
   */
  export interface PublicKey {
    verify(data: any, sig: any): Promise<any>
    marshal(): Buffer
    readonly bytes: Buffer
    equal(key: PublicKey): boolean
    hash(): Promise<Buffer>
  }

  /**
   * Generic private key interface.
   */
  export interface PrivateKey {
    sign(data: any): Promise<Buffer>
    readonly public: PublicKey
    marshal(): Buffer
    readonly bytes: Buffer
    equal(key: PublicKey): boolean
    hash(): Promise<Buffer>
    id(): Promise<string>
  }

  /**
   * Generic private/public keypair interface.
   */
  export interface Keypair {
    privateKey: PrivateKey
    publicKey: PublicKey
  }

  export namespace keys {

    const supportedKeys: any
    const keysPBM: any

    /**
     * Generates a keypair of the given type and bitsize.
     * @param type One of the supported key types.
     * @param bits Number of bits. Minimum of 1024.
     */
    export function generateKeyPair(type: KeyType, bits: number): Promise<Keypair>

    /**
     * Generates a keypair of the given type and bitsize.
     * @param type One of the supported key types.
     * @param seed A 32 byte uint8array.
     * @param bits Number of bits. Minimum of 1024.
     */
    export function generateKeyPairFromSeed(type: KeyType, seed: Uint32Array, bits: number): Promise<Keypair>

    /**
     * Generates an ephemeral public key and returns a function that will compute the shared secret key.
     * Focuses only on ECDH now, but can be made more general in the future.
     * @param curve The curve to use. One of 'P-256', 'P-384', 'P-521' is currently supported.
     */
    export function generateEphemeralKeyPair(curve: CurveType): Promise<{ key: Buffer, genSharedKey: Function }>

    // Generates a set of keys for each party by stretching the shared key.
    // cipherType: String, one of 'AES-128', 'AES-256', 'Blowfish'
    // hashType: String, one of 'SHA1', SHA256, SHA512
    // secret: Buffer
    // keyStretcher(cipherType, hashType, secret)
  //   const createKey = (res) => ({
  //   iv: res.slice(0, ivSize),
  //   cipherKey: res.slice(ivSize, ivSize + cipherKeySize),
  //   macKey: res.slice(ivSize + cipherKeySize)
  // })

  // return {
  //   k1: createKey(r1),
  //   k2: createKey(r2)
  // }

    /**
     * Converts a protobuf serialized public key into its representative object.
     * @param buf The protobuf serialized public key.
     */
    export function unmarshalPublicKey(buf: Buffer): Promise<PublicKey>

    /**
     * Converts a public key object into a protobuf serialized public key.
     * @param key An RSA, Ed25519, or Secp256k1 public key object.
     * @param type One of the supported key types.
     */
    export function marshalPublicKey(key: PublicKey, type: KeyType): Buffer

    /**
     * Converts a protobuf serialized private key into its representative object.
     * @param buf The protobuf serialized private key.
     */
    export function unmarshalPrivateKey(buf: Buffer): Promise<PrivateKey>

    /**
     * Converts a private key object into a protobuf serialized private key.
     * @param key An RSA, Ed25519, or Secp256k1 private key object.
     * @param type One of the supported key types.
     */
    export function marshalPrivateKey(key: PrivateKey, type: KeyType): Buffer

    /**
     * Converts a PEM password protected private key into its representative object.
     * @param pem Password protected private key in PEM format.
     * @param password The password used to protect the key.
     */
    export function import(pem: string, password: string): Promise<PrivateKey>
  }

  /**
   * Generates a Buffer populated by random bytes.
   * @param number The size of the random bytes Buffer.
   */
  export function randomBytes(number: number): Buffer

  /**
   * Computes the Password-Based Key Derivation Function 2.
   * @param password The password.
   * @param salt The salt.
   * @param iterations Number of iterations to use.
   * @param keySize The size of the output key in bytes.
   * @param hash The hash name ('sha1', 'sha2-512, ...)
   */
  export function pbkdf2(password: string | Buffer, salt: string | Buffer, iterations: number, keySize: number, hash: string): Buffer
}
