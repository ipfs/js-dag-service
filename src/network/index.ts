import { Peer } from '../core'
import { addSubclass } from '../utils'
import { Bitswap } from './bitswap'
import { Swarm } from './swarm'
import { Dht } from './dht'
import { PubSub } from './pubsub'

// Module augmentation to add APIs to Peer from core
declare module '../core' {
  interface Peer {
    bitswap: Bitswap
    swarm: Swarm
    dht: Dht
    pubsub: PubSub
  }
}

// Apply the subclasses
addSubclass(Peer, 'bitswap', Bitswap)
addSubclass(Peer, 'pubsub', PubSub)
addSubclass(Peer, 'swarm', Swarm)
addSubclass(Peer, 'dht', Dht)
