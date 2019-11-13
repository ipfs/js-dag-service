declare module 'peer-info' {
  import PeerId from 'peer-id'
  import { Multiaddr } from 'multiaddr'

  class MultiaddrSet {
    constructor (multiaddrs: string[])
    add (ma: string): void
    addSafe (ma: string): void
    toArray (): Multiaddr[]
    size: number
    forEach(fn: (...items: any[]) => any): void
    filterBy(maFmt: object): string[]
    has(ma: string): boolean
    delete(ma: string): boolean
    replace (existing: (string | Multiaddr)[] | (string | Multiaddr), fresh: (string | Multiaddr)[] | (string | Multiaddr)): void
    clear(): void
    distinct(): string[]
  }

  export class PeerInfo {
    constructor (peerId?: PeerId)
    disconnect (): void
    isConnected (): Multiaddr
    static create(peerId: PeerId | { id: string, privKey: Buffer, pubKey: Buffer }): Promise<PeerInfo>
    static isPeerInfo(peerInfo: any): boolean
    id: PeerId
    protocols: Set<string>
    multiaddrs: MultiaddrSet
  }
  // eslint-disable-next-line import/no-default-export
  export default PeerInfo
}
