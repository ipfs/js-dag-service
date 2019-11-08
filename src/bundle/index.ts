import TCP from 'libp2p-tcp'
import MulticastDNS from 'libp2p-mdns'
import WS from 'libp2p-websockets'
import WebSocketStarMulti from 'libp2p-websocket-star-multi'
import Bootstrap from 'libp2p-bootstrap'
import KadDHT from 'libp2p-kad-dht'
import GossipSub from 'libp2p-gossipsub'
import Multiplex from 'pull-mplex'
import SECIO from 'libp2p-secio'
import LibP2p, { Options } from 'libp2p'
import mergeOptions from 'merge-options'
import multiaddr from 'multiaddr'

const bootstrapPeers = [
  '/ip4/104.236.176.52/tcp/4001/ipfs/QmSoLnSGccFuZQJzRadHn95W2CrSFmZuTdDWP8HXaHca9z',
  '/ip4/104.131.131.82/tcp/4001/ipfs/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ',
  '/ip4/104.236.179.241/tcp/4001/ipfs/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM',
  '/ip4/162.243.248.213/tcp/4001/ipfs/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm',
  '/ip4/128.199.219.111/tcp/4001/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu',
  '/ip4/104.236.76.40/tcp/4001/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64',
  '/ip4/178.62.158.247/tcp/4001/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd',
  '/ip4/178.62.61.185/tcp/4001/ipfs/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3',
  '/ip4/104.236.151.122/tcp/4001/ipfs/QmSoLju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW36yx',
  '/ip6/2604:a880:1:20::1f9:9001/tcp/4001/ipfs/QmSoLnSGccFuZQJzRadHn95W2CrSFmZuTdDWP8HXaHca9z',
  '/ip6/2604:a880:1:20::203:d001/tcp/4001/ipfs/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM',
  '/ip6/2604:a880:0:1010::23:d001/tcp/4001/ipfs/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm',
  '/ip6/2400:6180:0:d0::151:6001/tcp/4001/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu',
  '/ip6/2604:a880:800:10::4a:5001/tcp/4001/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64',
  '/ip6/2a03:b0c0:0:1010::23:1001/tcp/4001/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd',
  '/ip6/2a03:b0c0:1:d0::e7:1/tcp/4001/ipfs/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3',
  '/ip6/2604:a880:1:20::1d9:6001/tcp/4001/ipfs/QmSoLju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW36yx',
  '/dns4/node0.preload.ipfs.io/tcp/443/wss/ipfs/QmZMxNdpMkewiVZLMRxaNxUeZpDUb34pWjZ1kZvsd16Zic',
  '/dns4/node1.preload.ipfs.io/tcp/443/wss/ipfs/Qmbut9Ywz9YEDrz8ySBSgWyJk41Uvm2QJPhwDJzJyGFsD6',
]

// See https://github.com/ipfs/js-ipfs/blob/master/src/core/runtime/libp2p-nodejs.js
export class Node extends LibP2p {
  constructor(_options: Options) {
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
        maxParallelDials: 150,
        maxColdCalls: 50,
        dialTimeout: 10e3, // Be strict with dial time
      },
      modules: {
        transport: [TCP, WS, wsstar],
        streamMuxer: [Multiplex],
        connEncryption: [SECIO],
        peerDiscovery: [MulticastDNS, Bootstrap, wsstar.discovery],
        dht: KadDHT,
        pubsub: GossipSub,
      },
      config: {
        peerDiscovery: {
          autoDial: true,
          mdns: {
            enabled: true,
            interval: 10,
          },
          bootstrap: {
            enabled: true,
            list: bootstrapPeers,
          },
          websocketStar: {
            enabled: true,
          },
          webRTCStar: {
            enabled: true,
          },
        },
        dht: {
          kBucketSize: 20,
          enabled: true,
          randomWalk: {
            enabled: false,
            queriesPerPeriod: 1,
            interval: 300e3,
            timeout: 10e3,
          },
        },
        pubsub: {
          enabled: true,
          emitSelf: true,
          signMessages: true,
          strictSigning: true,
        },
        relay: {
          enabled: true,
          hop: {
            enabled: false,
            active: false,
          },
        },
      },
    }

    super(mergeOptions(defaults, _options))
  }
}
