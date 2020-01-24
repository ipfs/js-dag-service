import { expect } from 'chai'
import { MemoryDatastore } from 'interface-datastore'
import CID from 'cids'
import delay from 'delay'
import { Peer, BlockStore } from '@textile/ipfs-lite-core'
import { createHost } from '@textile/ipfs-lite-host'

let lite: Peer

describe.skip('fetching IPLD dag from network', function() {
  before(async function() {
    const bs = new BlockStore(new MemoryDatastore())
    const host = await createHost(undefined, undefined, ['/ip4/0.0.0.0/tcp/0'])
    lite = new Peer(bs, host)
    await lite.start()
    await delay(500)
  })
  after(async function() {
    await lite.stop()
  })

  it.skip('request, fetch, and decode', async function() {
    const cid = new CID('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
    const block = await lite.get(cid)
    if (block && block.Data) {
      const msg = block.Data.toString()
        .replace(/[^0-9a-zA-Z_\s]/gi, '')
        .trim()
      expect(msg).to.eql('Hello World')
    } else {
      throw Error('Expected block to have data')
    }
  })
})
