export { Peer, Result } from './files'
export { BlockService } from './core/blockservice'
export { BlockStore, Block } from './core/blockstore'
export { setupLibP2PHost } from './create'
export { Options } from './core'

// Include MemoryDatastore for user convenience
export { MemoryDatastore } from 'interface-datastore'
// Include Buffer for user convenience
const BufferImpl = Buffer
export { BufferImpl as Buffer }
