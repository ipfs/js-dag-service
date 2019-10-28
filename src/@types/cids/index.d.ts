declare module 'cids' {
  export type Version = 0 | 1
  export type Codec = string
  export type Multihash = Buffer
  export type BaseEncodedString = string
  export type MultibaseName = string

  export class CID {
    constructor(version: Version, codec: Codec, multhash: Multihash, multibaseName?:MultibaseName)
    constructor(cidStr: BaseEncodedString)
    constructor(cidBuf: Buffer)

    codec: Codec
    multihash: Multihash
    buffer: Buffer
    prefix: Buffer

    toV0(): CID
    toV1(): CID
    toBaseEncodedString(base?: string): BaseEncodedString
    toString(): BaseEncodedString
    toJSON(): { codec: Codec, version: Version, hash: Multihash }

    equals(other: any): boolean

    static codecs: Record<string, Codec>
    static isCID(mixed: any): boolean
    static validateCID(other: any): void
  }

  // eslint-disable-next-line import/no-default-export
  export default CID
}
