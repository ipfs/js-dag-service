import WS from 'libp2p-websockets'
import WebSocketStarMulti from 'libp2p-websocket-star-multi'
import WebRTCStar from 'libp2p-webrtc-star'
import Multiplex from 'pull-mplex'
import SECIO from 'libp2p-secio'
import Bootstrap from 'libp2p-bootstrap'
import KadDHT from 'libp2p-kad-dht'
import GossipSub from 'libp2p-gossipsub'
import LibP2p, { Options } from 'libp2p'
import mergeOptions from 'merge-options'
import multiaddr from 'multiaddr'

const bootstrapPeers = [
  '/dns4/ams-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd',
  '/dns4/lon-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3',
  '/dns4/sfo-3.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM',
  '/dns4/sgp-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu',
  '/dns4/nyc-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm',
  '/dns4/nyc-2.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64',
  '/dns4/node0.preload.ipfs.io/tcp/443/wss/ipfs/QmZMxNdpMkewiVZLMRxaNxUeZpDUb34pWjZ1kZvsd16Zic',
  '/dns4/node1.preload.ipfs.io/tcp/443/wss/ipfs/Qmbut9Ywz9YEDrz8ySBSgWyJk41Uvm2QJPhwDJzJyGFsD6',
]

// See https://github.com/ipfs/js-ipfs/blob/master/src/core/runtime/libp2p-browser.js
export class Node extends LibP2p {
  constructor(_options: Options) {
    const wrtcstar = new WebRTCStar({ id: _options.peerInfo.id })

    // this can be replaced once optional listening is supported with the below code. ref: https://github.com/libp2p/interface-transport/issues/41
    // const wsstar = new WebSocketStar({ id: _options.peerInfo.id })
    const wsstarServers = _options.peerInfo.multiaddrs
      .toArray()
      .map(item => item.toString())
      .filter(addr => addr.includes('p2p-websocket-star'))
    _options.peerInfo.multiaddrs.replace(wsstarServers.map(multiaddr), '/p2p-websocket-star') // the ws-star-multi module will replace this with the chosen ws-star servers
    const wsstar = new WebSocketStarMulti({
      servers: wsstarServers,
      id: _options.peerInfo.id,
      // eslint-disable-next-line @typescript-eslint/camelcase
      ignore_no_online: !wsstarServers.length,
    })

    const defaults = {
      switch: {
        denyTTL: 2 * 60 * 1e3, // 2 minute base
        denyAttempts: 5, // back off 5 times
        maxParallelDials: 100,
        maxColdCalls: 25,
        dialTimeout: 20e3,
      },
      modules: {
        transport: [WS, wrtcstar, wsstar],
        streamMuxer: [Multiplex],
        connEncryption: [SECIO],
        peerDiscovery: [wrtcstar.discovery, wsstar.discovery, Bootstrap],
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
            enabled: false,
            interval: 10,
          },
        },
        dht: {
          enabled: false,
        },
        pubsub: {
          enabled: true,
          emitSelf: true,
        },
      },
    }

    super(mergeOptions(defaults, _options))
  }
}
