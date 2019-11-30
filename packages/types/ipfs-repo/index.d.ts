declare module 'ipfs-repo' {
  import { Datastore, Key, Query, Result } from 'interface-datastore'
  import CID from 'cids'
  import OldBlock from 'ipld-block'
  import NewBLock from '@ipld/block'

  type Block = OldBlock | NewBLock

  export interface Options {
    lock?: 'fs' | 'memory',
    storageBackends?: {
      root?: Datastore,
      blocks?: Datastore,
      keys?: Datastore,
      datastore?: Datastore
    },
    storageBackendOptions?: {
      root?: {
        extension?: string
      },
      blocks?: {
        sharding?: boolean,
        extension?: string
      },
      keys?: {}
    }
  }
  class Config {
    constructor(store: Datastore)
    get (key: string): Promise<object>
    set (key: string, value: object): Promise<void>
    exists(): Promise<boolean>
  }
  class Spec {
    constructor(store: Datastore)
    get (): Promise<Buffer>
    set (spec: number): Promise<void>
    exists(): Promise<boolean>
  }
  class ApiAddr {
    constructor(store: Datastore)
    get(): Promise<string>
    set(value: object): Promise<any>
    delete(): Promise<void>
  }
  class Version {
    constructor(store: Datastore)
    exists(): Promise<boolean>
    get(): Promise<number>
    set(version: number): Promise<void>
    check(expected: number): Promise<void>
  }
  interface Lockfile {
    close(): Promise<void>
  }
  interface Lock {
    lock(dir: string): Promise<Lockfile>
    locked(dir: string): boolean
  }
  interface Stats {
    repoPath: string
    storageMax: number
    version: string
    numObjects: number
    repoSize: number
  }
  interface BlockstoreOptions {
    valueEncoding?: string
    compression?: boolean
    sharding?: boolean
    extension?: string
  }
  export class Blockstore {
    constructor(store: Datastore, options: BlockstoreOptions)
    query(query: Query): AsyncIterable<Result>
    get(cid: CID): Promise<Block>
    put(block: Block): Promise<void>
    putMany(blocks: AsyncIterable<Block>|Iterable<Block>): Promise<void>
    has(cid: CID): Promise<boolean>
    delete(cid: CID): Promise<void>
  }
  class IpfsRepo {
    constructor (repoPath: string, options?: Options)
    root: Datastore
    version: Version
    config: Config
    spec: Spec
    apiAddr: ApiAddr
    _locker: Lock
    options: Options
    closed: boolean
    path: string
    lockfile?: Lockfile
    datastore?: Datastore
    blocks?: Blockstore
    keys?: Datastore
    init(config: Config): Promise<void>
    open(): Promise<void>
    close(): Promise<void>
    exists(): Promise<boolean>
    stat(options: {human: boolean}): Promise<Stats>
    getSize(queryFunc: Query): number
  }
  // eslint-disable-next-line import/no-default-export
  export default IpfsRepo
  export namespace utils {
    export namespace blockstore {
      export function cidToKey(cid: CID): Key
      export function keytoCid(key: Key): CID
    }
  }
  export const repoVersion: number
  export namespace errors {
    export const LockExistsError: Error
    export const NotFoundError: Error
    export const ERR_REPO_NOT_INITIALIZED: string
    export const ERR_REPO_ALREADY_OPEN: string
    export const ERR_REPO_ALREADY_CLOSED: string
  }
}
