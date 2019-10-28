declare module 'interface-datastore' {
  export class Key {
    constructor (s: Buffer | string, clean?: boolean)
    toString (encoding?: string): string
    toBuffer (): Buffer
    // get [Symbol.toStringTag] (): string
    static withNamespaces (list: Array<string>): Key
    static random (): Key
    clean (): void
    less (key: Key): boolean
    reverse (): Key
    namespaces (): Array<string>
    baseNamespace (): string
    list (): Array<string>
    type (): string
    name (): string
    instance (s: string): Key
    path (): Key
    parent (): Key
    child (key: Key): Key
    isAncestorOf (other: Key): boolean
    isDecendantOf (other: Key): boolean
    isTopLevel (): boolean
    concat (...keys: Array<Key>): Key
  }
  export type Value = Buffer
  export interface Result {
    key: Key
    value: Value
  }
  export namespace Query {
    export type Filter<T> = (val: T) => boolean
    export type Order<T> = (itertable: Iterable<T>, sorter: (vals: T[]) => T[]) => Iterable<T>
  }
  export interface Query {
    prefix?: string
    filters?: Array<Query.Filter<Result>>
    orders?: Array<Query.Order<Result>>
    limit?: number
    offset?: number
    keysOnly?: boolean
  }
  export interface Datastore {
    open(): any
    put(key: Key, val: Value): Promise<void>
    get(key: Key): Promise<Value>
    has(key: Key): Promise<boolean>
    delete(key: Key): Promise<void>
    batch(): Batch
    query (q: Query): AsyncIterable<Result>
    close (): any
  }
  export interface Batch {
    put (key: Key, value: Value): void
    delete (key: Key): void
    commit(): Promise<void>
  }
  export class MemoryDatastore implements Datastore {
    constructor()
    open(): Promise<void>
    put(key: Key, val: Value): Promise<void>
    get(key: Key): Promise<Value>
    has(key: Key): Promise<boolean>
    delete(key: Key): Promise<void>
    batch(): Batch
    query (q: Query): AsyncIterable<Result>
    close (): Promise<void>
  }
  export namespace Errors {
    export function dbOpenFailedError(error: Error): Error
    export function dbDeleteFailedError(error: Error): Error
    export function dbWriteFailedError(error: Error): Error
    export function notFoundError(error: Error): Error
  }
}
