import './files'
import './setup'
import './files'
import './network'

export { Result } from './files'
export { BlockService, BlockStore, Block, PeerOptions, Peer } from './core'
export { setupLibP2PHost } from './setup'

// Include MemoryDatastore for user convenience
export { MemoryDatastore } from 'interface-datastore'
// Include Buffer for user convenience
const BufferImpl = Buffer
export { BufferImpl as Buffer }
