import WS from "libp2p-websockets";
import WebRTCStar from "libp2p-webrtc-star";
import Multiplex from "libp2p-mplex";
import SECIO from "libp2p-secio";
import { NOISE } from "libp2p-noise";
import Bootstrap from "libp2p-bootstrap";
import KadDHT from "libp2p-kad-dht";
import GossipSub from "libp2p-gossipsub";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import type { Libp2pOptions } from "libp2p";

const bootstrapPeers = [
  "/dnsaddr/bootstrap.libp2p.io/tcp/443/wss/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
  "/dnsaddr/bootstrap.libp2p.io/tcp/443/wss/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt",
  "/dnsaddr/bootstrap.libp2p.io/tcp/443/wss/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
  "/dnsaddr/bootstrap.libp2p.io/tcp/443/wss/p2p/QmZa1sAxajnQjVM8WjWXoMbmPd7NsWhfKsPkErzpm9wGkp",
  "/dnsaddr/bootstrap.libp2p.io/tcp/443/wss/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
  "/dns4/node0.preload.ipfs.io/tcp/443/wss/p2p/QmZMxNdpMkewiVZLMRxaNxUeZpDUb34pWjZ1kZvsd16Zic",
  "/dns4/node1.preload.ipfs.io/tcp/443/wss/p2p/Qmbut9Ywz9YEDrz8ySBSgWyJk41Uvm2QJPhwDJzJyGFsD6",
  "/dns4/node2.preload.ipfs.io/tcp/443/wss/p2p/QmV7gnbW5VTcJ3oyM2Xk1rdFBJ3kTkvxc87UFGsun29STS",
  "/dns4/node3.preload.ipfs.io/tcp/443/wss/p2p/QmY7JB6MQXhxHvq7dBDh4HpbH29v4yE9JRadAVpndvzySN",
];

// See https://github.com/ipfs/js-ipfs/blob/master/src/core/runtime/libp2p-browser.js
export const defaults: Omit<Libp2pOptions, "peerId"> = {
  dialer: {
    maxParallelDials: 150, // 150 total parallel multiaddr dials
    maxDialsPerPeer: 4, // Allow 4 multiaddrs to be dialed per peer in parallel
    dialTimeout: 10e3, // 10 second dial timeout per peer dial
  },
  modules: {
    transport: [WS, WebRTCStar],
    streamMuxer: [Multiplex],
    connEncryption: [SECIO, NOISE],
    peerDiscovery: [Bootstrap],
    dht: KadDHT,
    pubsub: GossipSub,
  },
  config: {
    peerDiscovery: {
      autoDial: true,
      // [Bootstrap.tag] = 'bootstrap'
      bootstrap: {
        enabled: true,
        list: bootstrapPeers,
      },
      // [WebRTCStar.discovery.tag]
      webRTCStar: {
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
    threshold: 1,
  },
};
