import TCP from "libp2p-tcp";
import MulticastDNS from "libp2p-mdns";
import WS from "libp2p-websockets";
import KadDHT from "libp2p-kad-dht";
import GossipSub from "libp2p-gossipsub";
import Multiplex from "libp2p-mplex";
import SECIO from "libp2p-secio";
import { NOISE } from "libp2p-noise";
import Bootstrap from "libp2p-bootstrap";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Libp2pOptions } from "libp2p";

const bootstrapPeers = [
  "/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmZa1sAxajnQjVM8WjWXoMbmPd7NsWhfKsPkErzpm9wGkp",
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt",
  "/dns4/node1.preload.ipfs.io/tcp/443/wss/p2p/Qmbut9Ywz9YEDrz8ySBSgWyJk41Uvm2QJPhwDJzJyGFsD6",
  "/dns4/node2.preload.ipfs.io/tcp/443/wss/p2p/QmV7gnbW5VTcJ3oyM2Xk1rdFBJ3kTkvxc87UFGsun29STS",
  "/dns4/node3.preload.ipfs.io/tcp/443/wss/p2p/QmY7JB6MQXhxHvq7dBDh4HpbH29v4yE9JRadAVpndvzySN",
];

// See https://github.com/ipfs/js-ipfs/blob/master/src/core/runtime/libp2p-nodejs.js
export const defaults: Omit<Libp2pOptions, "peerId"> = {
  dialer: {
    maxParallelDials: 150, // 150 total parallel multiaddr dials
    maxDialsPerPeer: 4, // Allow 4 multiaddrs to be dialed per peer in parallel
    dialTimeout: 10e3, // 10 second dial timeout per peer dial
  },
  modules: {
    transport: [TCP, WS],
    streamMuxer: [Multiplex],
    connEncryption: [SECIO, NOISE],
    peerDiscovery: [MulticastDNS, Bootstrap],
    dht: KadDHT,
    pubsub: GossipSub,
  },
  config: {
    peerDiscovery: {
      autoDial: true,
      [(MulticastDNS as any).tag]: {
        enabled: true,
      },
      // Optimization
      // Requiring bootstrap inline in components/libp2p to reduce the cli execution time
      // [Bootstrap.tag] = 'bootstrap'
      bootstrap: {
        enabled: true,
        list: bootstrapPeers,
      },
      websocketStar: {
        enabled: true,
      },
    },
    dht: {
      kBucketSize: 20,
      enabled: false,
      clientMode: true,
      randomWalk: {
        enabled: false,
      },
    },
    pubsub: {
      enabled: true,
      emitSelf: true,
    },
  },
  metrics: {
    enabled: true,
  },
  peerStore: {
    persistence: true,
  },
};
