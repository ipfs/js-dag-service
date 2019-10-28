declare module 'ipfs-unixfs' {
  namespace UnixFS {
    export type DataType = 'raw' | 'directory' | 'file' | 'metadata' | 'symlink' | 'hamt-sharded-directory'
    export type DirType = 'directory' | 'hamt-sharded-directory'
  }
  class UnixFS {
    constructor(type: UnixFS.DataType, content?: any)
    type: UnixFS.DataType
    data: Buffer
    addBlockSize(size: number): void
    removeBlockSize(index: number): void
    fileSize(): number | undefined
    marshal(): Buffer
    static unmarshal(marsheled: Buffer): UnixFS
  }
  // eslint-disable-next-line import/no-default-export
  export default UnixFS
}
