/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createReadStream, promises as fs } from 'fs'
import { expect } from 'chai'
import { MemoryDatastore } from 'interface-datastore'
import { Peer, BlockStore } from '@textile/ipfs-lite-core'
import { createHost } from '@textile/ipfs-lite-host'
import delay from 'delay'
import '.'
import { Result } from '.'

describe('Files API', function() {
  let lite: Peer
  let root: Result | undefined
  before(async function() {
    const bs = new BlockStore(new MemoryDatastore())
    const host = await createHost(undefined, undefined, ['/ip4/0.0.0.0/tcp/0'])
    lite = new Peer(bs, host)
    await lite.start()
    return await delay(500)
  })

  after(async function() {
    await lite.stop()
    await fs.unlink('bar.txt')
    return
  })
  describe('add and get File', function() {
    it('should read file from disc and put to "network"', async function() {
      await fs.writeFile('bar.txt', 'Hello World')
      const source = [
        {
          path: 'bar',
          content: createReadStream('bar.txt'),
        },
      ]
      root = await lite.addFile(source)
      // `result` should be the root DAG node
      const str = 'bafkreiffsgtnic7uebaeuaixgph3pmmq2ywglpylzwrswv5so7m23hyuny'
      expect(root!.cid.toString()).to.eql(str)
    })

    it('should get block from "network" and recursively export', async function() {
      const content = await lite.getFile(root!.cid.toString())
      expect(content.toString()).to.eql('Hello World')
    })
  })
})
