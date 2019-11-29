import '@textile/ipfs-lite-network'
export { Block, BlockStore, BlockService, DAGService, DAGOptions, Peer, PeerOptions } from '@textile/ipfs-lite-core'
// @todo: Actually use this to augment Peer, and create a static 'init' method.
// Should also wrap in a level-datastore, so that it is essentially a no-config IPFS Lite Peer
export { setupLibP2PHost } from './setup'
