import { MemoryDatastore } from 'interface-datastore'
import CID from 'cids'
import { Peer } from '../src'
import { Blockstore } from '../src/blockstore'
import { setupLibP2PHost } from './utils'

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
let lite: Peer

beforeAll(async () => {
  const bs = new Blockstore(new MemoryDatastore())
  const host = await setupLibP2PHost(undefined, undefined, ['/ip4/0.0.0.0/tcp/4005'])
  lite = new Peer(bs, host)
  await lite.start()
  await sleep(500)
})

describe.skip('fetching IPLD dag from network', () => {
  it('request, fetch, and decode', async () => {
    jest.setTimeout(30000)
    const cid = new CID('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
    const block = await lite.get(cid)
    if (block && block.data) {
      const msg = block.data.toString()
      expect(msg).toEqual('Hello World')
    }
    await lite.stop()
  })
})
