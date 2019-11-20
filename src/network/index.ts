import { Peer } from '../core'
import { addSubclass } from '../utils'
import { BitswapAPI } from './bitswap'
import { SwarmAPI } from './swarm'
import { DhtAPI } from './dht'
import { PubSubAPI } from './pubsub'

// Module augmentation to add APIs to Peer from core
declare module '../core' {
  interface Peer {
    bitswap: BitswapAPI
    swarm: SwarmAPI
    dht: DhtAPI
    pubsub: PubSubAPI
  }
}

addSubclass(Peer, 'bitswap', BitswapAPI)
addSubclass(Peer, 'pubsub', PubSubAPI)
addSubclass(Peer, 'swarm', SwarmAPI)
addSubclass(Peer, 'dht', DhtAPI)
