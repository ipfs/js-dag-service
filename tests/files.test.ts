import { createReadStream, promises as fs } from 'fs'
import { MemoryDatastore } from 'interface-datastore'
import { Peer, setupLibP2PHost, BlockStore } from '../src'
import '../src/files'
import { Result } from '../src/files'

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
let lite: Peer
let root: Result | undefined

describe('getting and putting files', () => {
  beforeAll(async () => {
    const bs = new BlockStore(new MemoryDatastore())
    const host = await setupLibP2PHost(undefined, undefined, ['/ip4/0.0.0.0/tcp/0'])
    lite = new Peer(bs, host)
    await lite.start()
    await sleep(500)
  })
  afterAll(async () => {
    await lite.stop()
    await fs.unlink('bar.txt')
  })

  it('read file from disc and put to "network"', async () => {
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(root!.cid.toString()).toEqual(str)
  })

  it('get block from "network" and recursively export', async () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const content = await lite.getFile(root!.cid.toString())
    expect(content.toString()).toEqual('Hello World')
  })
})
