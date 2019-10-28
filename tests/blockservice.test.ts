import CID from 'cids'
import multihashing from 'multihashing-async'
import { collect } from 'streaming-iterables'
import Bitswap from 'ipfs-bitswap'
import { MemoryDatastore } from 'interface-datastore'
import { BlockService } from '../src/blockservice'
import { Blockstore, Block } from '../src/blockstore'

let bs: BlockService
let testBlocks: Block[]
const store = new Blockstore(new MemoryDatastore())

beforeAll(async () => {
  bs = new BlockService(store)

  const datas = [Buffer.from('1'), Buffer.from('2'), Buffer.from('3'), Buffer.from('A random data block')]

  testBlocks = await Promise.all(
    datas.map(async (data: Buffer) => {
      const hash = await multihashing(data, 'sha2-256')
      return new Block(data, new CID(hash))
    }),
  )
})

describe('fetch only from local Repo', () => {
  it('store and get a block', async () => {
    const b = testBlocks[3]

    await bs.put(b)
    const res = await bs.get(b.cid)
    if (res) {
      expect(res.cid).toEqual(b.cid)
      expect(res.data).toEqual(b.data)
    }
  })

  it('get a non stored yet block', async () => {
    const b = testBlocks[2]

    try {
      await bs.get(b.cid)
    } catch (err) {
      expect(err).toBeDefined()
    }
  })

  it('store many blocks', async () => {
    bs.putMany(testBlocks)
    for (const block of testBlocks) {
      expect(bs.store.has(block.cid)).toBeTruthy
    }
  })

  it('get many blocks through .get', async () => {
    await bs.putMany(testBlocks)
    const blocks = await Promise.all(testBlocks.map(async b => bs.get(b.cid)))
    expect(blocks).toEqual(testBlocks)
  })

  it('get many blocks through .getMany', async () => {
    const cids = testBlocks.map(b => b.cid)
    await bs.putMany(testBlocks)
    const blocks = await collect(bs.getMany(cids) as any)
    expect(blocks).toEqual(testBlocks)
  })

  it('delete a block', async () => {
    const data = Buffer.from('Will not live that much')

    const hash = await multihashing(data, 'sha2-256')
    const b = { data, cid: new CID(hash) }

    await bs.put(b)
    await bs.delete(b.cid)
    const res = await bs.store.has(b.cid)
    expect(res).toEqual(false)
  })

  it('stores and gets lots of blocks', async function() {
    jest.setTimeout(8 * 1000)

    const datas = [...Array(1000)].map((_, i) => {
      return Buffer.from(`hello-${i}-${Math.random()}`)
    })

    const blocks = await Promise.all(
      datas.map(async data => {
        const hash = await multihashing(data, 'sha2-256')
        return new Block(data, new CID(hash))
      }),
    )

    await bs.putMany(blocks)

    const res = await Promise.all(blocks.map(async b => bs.get(b.cid)))
    expect(res).toEqual(blocks)
  })

  it('sets and unsets exchange', () => {
    bs = new BlockService(store)
    bs.exchange = {} as Bitswap
    expect(bs.online()).toBeTruthy()
    bs.exchange = undefined
    expect(bs.online()).toBeFalsy()
  })
})

describe('fetch through Bitswap (has exchange)', () => {
  beforeEach(() => {
    bs = new BlockService(store)
  })

  it('online returns true when online', () => {
    bs.exchange = {} as Bitswap
    expect(bs.online()).toBeTruthy()
  })

  it('retrieves a block through bitswap', async () => {
    // returns a block with a value equal to its key
    const bitswap = {
      get(cid: CID) {
        return new Block(Buffer.from('secret'), cid)
      },
    }

    bs.exchange = (bitswap as any) as Bitswap

    const data = Buffer.from('secret')

    const hash = await multihashing(data, 'sha2-256')
    const block = await bs.get(new CID(hash))
    expect(block).toBeDefined()
    if (block) {
      expect(block.data).toEqual(data)
    }
  })

  it('puts the block through bitswap', async () => {
    const puts: Block[] = []
    const bitswap = {
      put(block: Block) {
        puts.push(block)
      },
    }
    bs.exchange = (bitswap as any) as Bitswap

    const data = Buffer.from('secret sauce')

    const hash = await multihashing(data, 'sha2-256')
    await bs.put(new Block(data, new CID(hash)))

    expect(puts).toHaveLength(1)
  })
})
