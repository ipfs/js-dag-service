import { MemoryDatastore } from 'interface-datastore'
import { Peer, BlockStore } from '../src'
import { setupLibP2PHost } from '../src/setup'

const writeKey = require('libp2p/src/pnet').generate
const DAG_CBOR = require('multicodec').DAG_CBOR

const swarmKey = Buffer.alloc(95)
writeKey(swarmKey)

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

let p1: Peer
let p2: Peer

describe('sync IPLD DAG between IPFS lite peers', () => {
  beforeAll(async () => {
    jest.setTimeout(20000)
    p1 = new Peer(
      new BlockStore(new MemoryDatastore()),
      await setupLibP2PHost(undefined, swarmKey, ['/ip4/0.0.0.0/tcp/0']),
    )
    p2 = new Peer(
      new BlockStore(new MemoryDatastore()),
      await setupLibP2PHost(undefined, swarmKey, ['/ip4/0.0.0.0/tcp/0']),
    )
    await p1.start()
    await p2.start()
    await sleep(500)
    await p1.host.dial(p2.host.peerInfo)
    await p2.host.dial(p1.host.peerInfo)
  })
  afterAll(async () => {
    await p1.stop()
    await p2.stop()
  })

  it('add, sync, get, delete, test', async () => {
    jest.setTimeout(30000)
    const data = {
      akey: 'avalue',
    }
    const cid = await p1.put(data, DAG_CBOR)
    console.log(`created node: ${cid}`)
    const test = await p2.get(cid)
    expect(cid.toString()).toEqual('bafyreigzkampgfuhmld36ljrywwcxogf5zyjbkasehbggbmgpy5tmrygpe')
    expect(test).toEqual(data)
    await p1.remove(cid)
    expect(await p1.hasBlock(cid)).toBeFalsy()
    await p2.remove(cid)
    expect(await p2.hasBlock(cid)).toBeFalsy()
  })
})
