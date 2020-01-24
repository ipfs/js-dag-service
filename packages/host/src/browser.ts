/* eslint-disable @typescript-eslint/no-var-requires */
import Multiaddr from 'multiaddr'
import merge from 'deepmerge'
import isPlainObject from 'is-plain-object'
import { creator, Options } from './utils'

const WS = require('libp2p-websockets')
const WebSocketStarMulti = require('libp2p-websocket-star-multi')
const WebRTCStar = require('libp2p-webrtc-star')
const Multiplex = require('pull-mplex')
const SECIO = require('libp2p-secio')
const Bootstrap = require('libp2p-bootstrap')
const KadDHT = require('libp2p-kad-dht')
const GossipSub = require('libp2p-gossipsub')
const LibP2p = require('libp2p')

export { Options }

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
      .map((item: any) => item.toString())
      .filter((addr: any) => addr.includes('p2p-websocket-star'))
    _options.peerInfo.multiaddrs.replace(wsstarServers.map(Multiaddr), '/p2p-websocket-star') // the ws-star-multi module will replace this with the chosen ws-star servers
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
        transport: [WS, wsstar, wrtcstar],
        streamMuxer: [Multiplex],
        connEncryption: [SECIO],
        peerDiscovery: [wsstar.discovery, Bootstrap, wrtcstar.discovery],
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
          enabled: true,
        },
        pubsub: {
          enabled: true,
          emitSelf: true,
        },
      },
      connectionManager: {
        minPeers: 10,
        maxPeers: 50,
      },
    }
    super(
      merge(defaults, _options, {
        isMergeableObject: isPlainObject,
      }),
    )
  }
}

export const createHost = creator(Node)
