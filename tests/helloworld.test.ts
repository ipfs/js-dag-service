import { MemoryDatastore } from 'interface-datastore'
import CID from 'cids'
import { Peer } from '../src'
import { BlockStore } from '../src/blockstore'
import { setupLibP2PHost } from './utils'

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
let lite: Peer

describe.skip('fetching IPLD dag from network', () => {
  beforeAll(async () => {
    const bs = new BlockStore(new MemoryDatastore())
    const host = await setupLibP2PHost(undefined, undefined, ['/ip4/0.0.0.0/tcp/4005'])
    lite = new Peer(bs, host)
    await lite.start()
    await sleep(500)
  })
  afterAll(async () => {
    await lite.stop()
  })

  it.skip('request, fetch, and decode', async () => {
    jest.setTimeout(30000)
    const cid = new CID('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
    const block = await lite.get(cid)
    if (block && block.Data) {
      const msg = block.Data.toString()
        .replace(/[^0-9a-zA-Z_\s]/gi, '')
        .trim()
      expect(msg).toEqual('Hello World')
    } else {
      throw Error('Expected block to have data')
    }
  })
})
