import { Peer } from "../core";
import { addSubclass } from "../utils";
import { Bitswap } from "./bitswap";
import { Swarm } from "./swarm";
import { Dht } from "./dht";
import { PubSub } from "./pubsub";

// Module augmentation to add APIs to Peer from core
declare module "../core" {
  interface Peer {
    /**
     * Access to the libp2p host's bitswap agent.
     */
    bitswap: Bitswap;
    /**
     * Access to the libp2p host's peer swarm.
     */
    swarm: Swarm;
    /**
     * Access to the libp2p host's distributed hash table module.
     */
    dht: Dht;
    /**
     * Access to the libp2p host's pubsub module.
     */
    pubsub: PubSub;
  }
}

addSubclass(Peer, "bitswap", Bitswap);
addSubclass(Peer, "pubsub", PubSub);
addSubclass(Peer, "swarm", Swarm);
addSubclass(Peer, "dht", Dht);
