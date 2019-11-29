import { Peer, utils } from '@textile/ipfs-lite-core'
import { Bitswap } from './bitswap'
import { Swarm } from './swarm'
import { Dht } from './dht'
import { PubSub } from './pubsub'

// Module augmentation to add APIs to Peer from core
declare module '@textile/ipfs-lite-core' {
  interface Peer {
    /**
     * Access to the libp2p host's bitswap agent.
     */
    bitswap: Bitswap
    /**
     * Access to the libp2p host's peer swarm.
     */
    swarm: Swarm
    /**
     * Access to the libp2p host's distributed hash table module.
     */
    dht: Dht
    /**
     * Access to the libp2p host's pubsub module.
     */
    pubsub: PubSub
  }
}

utils.addSubclass(Peer, 'bitswap', Bitswap)
utils.addSubclass(Peer, 'pubsub', PubSub)
utils.addSubclass(Peer, 'swarm', Swarm)
utils.addSubclass(Peer, 'dht', Dht)
