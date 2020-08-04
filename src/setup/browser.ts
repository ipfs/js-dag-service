import WS from "libp2p-websockets";
import WebRTCStar from "libp2p-webrtc-star";
import Multiplex from "libp2p-mplex";
import { NOISE } from "libp2p-noise";
import SECIO from "libp2p-secio";
import Bootstrap from "libp2p-bootstrap";
import KadDHT from "libp2p-kad-dht";
import GossipSub from "libp2p-gossipsub";
import type { Options } from "libp2p";

const bootstrapPeers = [
  "/dns4/ams-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd",
  "/dns4/lon-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3",
  "/dns4/sfo-3.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM",
  "/dns4/sgp-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu",
  "/dns4/nyc-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm",
  "/dns4/nyc-2.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64",
  "/dns4/node0.preload.ipfs.io/tcp/443/wss/p2p/QmZMxNdpMkewiVZLMRxaNxUeZpDUb34pWjZ1kZvsd16Zic",
  "/dns4/node1.preload.ipfs.io/tcp/443/wss/p2p/Qmbut9Ywz9YEDrz8ySBSgWyJk41Uvm2QJPhwDJzJyGFsD6",
  "/dns4/node2.preload.ipfs.io/tcp/443/wss/p2p/QmV7gnbW5VTcJ3oyM2Xk1rdFBJ3kTkvxc87UFGsun29STS",
  "/dns4/node3.preload.ipfs.io/tcp/443/wss/p2p/QmY7JB6MQXhxHvq7dBDh4HpbH29v4yE9JRadAVpndvzySN",
];

// See https://github.com/ipfs/js-ipfs/blob/master/src/core/runtime/libp2p-browser.js
export const defaults: Omit<Options, "peerId"> = {
  dialer: {
    maxParallelDials: 150, // 150 total parallel multiaddr dials
    maxDialsPerPeer: 4, // Allow 4 multiaddrs to be dialed per peer in parallel
    dialTimeout: 10e3, // 10 second dial timeout per peer dial
  },
  switch: {
    denyTTL: 2 * 60 * 1e3, // 2 minute base
    denyAttempts: 5, // back off 5 times
    maxParallelDials: 100,
    maxColdCalls: 25,
    dialTimeout: 20e3,
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
      bootstrap: {
        enabled: true,
        list: bootstrapPeers,
      },
      webRTCStar: {
        enabled: true,
      },
      websocketStar: {
        enabled: true,
      },
      mdns: {
        enabled: true,
        interval: 10,
      },
    },
    relay: {
      enabled: true,
      hop: {
        enabled: false,
        active: false,
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
