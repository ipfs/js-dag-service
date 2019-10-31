import { createReadStream, promises as fs } from 'fs'
import { MemoryDatastore } from 'interface-datastore'
import exporter from 'ipfs-unixfs-exporter'
import importer from 'ipfs-unixfs-importer'
import { Peer } from '../src'
import { BlockStore } from '../src/blockstore'
import { setupLibP2PHost } from './utils'

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
let lite: Peer
const results: any[] = []

describe('getting and putting files', () => {
  beforeAll(async () => {
    const bs = new BlockStore(new MemoryDatastore())
    const host = await setupLibP2PHost(undefined, undefined, ['/ip4/0.0.0.0/tcp/4004'])
    lite = new Peer(bs, host)
    await lite.start()
    await sleep(500)
  })
  afterAll(async () => {
    await lite.stop()
  })

  it('read file from disc and put to "network"', async () => {
    // `importer` chunks and adds content to the DAG service from a reader.
    // The content is stored as a UnixFS DAG (default for IPFS).
    // It returns the root IPLD node.
    await fs.writeFile('bar.txt', 'Hello World')
    const source = [
      {
        path: '/tmp/foo/bar.txt',
        content: createReadStream('bar.txt'),
      },
    ]
    for await (const entry of importer(source, lite, { cidVersion: 1, codec: 'dag-pb' })) {
      console.log(entry.cid.toString())
      results.push(entry)
    }
    // `result` should be the root DAG node
    const str = 'bafybeibvxlf7xydshz54ri6bmlrc3h32old6oepldoro2tllvaj3a2o77a'
    expect(results[results.length - 1].cid.toString()).toEqual(str)
  })

  it('get block from "network" and recursively export', async () => {
    const bufs = []
    const entry = await exporter(results[0].cid.toString(), lite)
    if (entry.content) {
      for await (const buf of entry.content()) {
        bufs.push(buf as Buffer)
      }
    }
    const content = Buffer.concat(bufs)

    console.info(content)
    expect(content.toString()).toEqual('Hello World')
  })
})
