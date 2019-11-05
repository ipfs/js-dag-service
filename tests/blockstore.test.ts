import CID from 'cids'
import { Key, MemoryDatastore, Query } from 'interface-datastore'
import multihashing from 'multihashing-async'
import { collect } from 'streaming-iterables'
import { cidToKey, keyToCid, Block, BlockStore } from '../src/blockstore'

let blocks: BlockStore

class ExplodingStore {
  commitInvoked: boolean
  putInvoked: boolean
  constructor() {
    this.commitInvoked = false
    this.putInvoked = false
  }
  close() {
    return
  }
  async has(_key: Key) {
    return true
  }
  async get(_key: Key) {
    throw new Error('error')
    return Buffer.from('error')
  }
  batch() {
    return {
      put: async (_key: Key, _value: Buffer) => {
        this.putInvoked = true
      },
      commit: async () => {
        this.commitInvoked = true
      },
      delete: async (_key: Key) => {
        return
      },
    }
  }
  open() {
    return
  }
  async put(_key: Key, _value: Buffer) {
    return
  }
  async delete(_key: Key) {
    return
  }
  async *query(_query: Query) {
    yield { key: new Key(''), value: Buffer.from('data') }
  }
}

beforeAll(async () => {
  blocks = new BlockStore(new MemoryDatastore())
})

describe('BlockStore', () => {
  it('converts a CID to a datastore Key and back', () => {
    const originalCid = new CID('Qme6KJdKcp85TYbLxuLV7oQzMiLremD7HMoXLZEmgo6Rnh')
    const key = cidToKey(originalCid)
    expect(key instanceof Key).toBeTruthy()
    const cid = keyToCid(key)
    expect(cid instanceof CID).toBeTruthy()
    // We'll always get back a v1 CID, so use toV0 to compare
    expect(cid.toV0().toString()).toEqual(originalCid.toString())
  })

  const blockData = [...Array(100).keys()].map(i => Buffer.from(`hello-${i}-${Math.random()}`))
  const bData = Buffer.from('hello world')
  let b: Block

  beforeAll(async () => {
    const hash = await multihashing(bData, 'sha2-256')
    b = new Block(bData, new CID(hash))
  })

  describe('.put', () => {
    let other: BlockStore

    it('simple', async () => {
      await blocks.put(b)
    })

    it('multi write (locks)', async () => {
      await Promise.all([blocks.put(b), blocks.put(b)])
    })

    it('empty value', async () => {
      const d = Buffer.alloc(0)
      const multihash = await multihashing(d, 'sha2-256')
      const empty = new Block(d, new CID(multihash))
      await blocks.put(empty)
    })

    it('massive multiwrite', async function() {
      jest.setTimeout(15000) // add time for ci
      const hashes = await Promise.all(blockData.map(b => multihashing(b, 'sha2-256')))
      await Promise.all(
        blockData.map((b: Buffer, i: number) => {
          const block = new Block(b, new CID(hashes[i]))
          return blocks.put(block)
        }),
      )
    })

    it('.putMany', async function() {
      jest.setTimeout(15000) // add time for ci
      // .map(i => Buffer.from(`hello-${i}-${Math.random()}`))
      const blks = await Promise.all(
        [...Array(50).keys()].map(async () => {
          const d = Buffer.from('many' + Math.random())
          const hash = await multihashing(d, 'sha2-256')
          return new Block(d, new CID(hash))
        }),
      )
      await blocks.putMany(blks)
      for (const block of blks) {
        const block1 = await blocks.get(block.cid)
        expect(block1).toEqual(block)
      }
    })

    it('should not .putMany when block is already present', async () => {
      const data = Buffer.from(`TEST${Date.now()}`)
      const hash = await multihashing(data, 'sha2-256')
      const cid = new CID(hash)
      const store = new ExplodingStore()
      other = new BlockStore(store)

      await other.putMany([
        {
          cid,
          data,
        },
      ])

      expect(store.putInvoked).toBeFalsy()
      expect(store.commitInvoked).toBeTruthy()
    })

    it('returns an error on invalid block', async () => {
      try {
        await blocks.put('hello' as any)
        throw new Error('Shoudl have thrown error on invalid block')
      } catch (err) {
        expect(err).toBeDefined()
      }
    })
  })

  describe('.get', () => {
    let other: BlockStore

    it('simple', async () => {
      const block = await blocks.get(b.cid)
      expect(block).toEqual(b)
    })

    it('massive read', async function() {
      jest.setTimeout(15000) // add time for ci
      await Promise.all(
        [...Array(20 * 100).keys()].map(async i => {
          const j = i % blockData.length
          const hash = await multihashing(blockData[j], 'sha2-256')
          const block = await blocks.get(new CID(hash))
          expect(block.data).toEqual(blockData[j])
        }),
      )
    })

    it('returns an error on invalid block', async () => {
      try {
        await blocks.get('woot' as any)
      } catch (err) {
        expect(err).toBeDefined()
        return
      }
      throw new Error('Shoudl have thrown error on invalid block')
    })

    it('should get block stored under v0 CID with a v1 CID', async () => {
      const data = Buffer.from(`TEST${Date.now()}`)
      const hash = await multihashing(data, 'sha2-256')
      const cid = new CID(hash)
      await blocks.put(new Block(data, cid))
      const block = await blocks.get(cid.toV1())
      expect(block.data).toEqual(data)
    })

    it('should get block stored under v1 CID with a v0 CID', async () => {
      const data = Buffer.from(`TEST${Date.now()}`)

      const hash = await multihashing(data, 'sha2-256')
      const cid = new CID(1, 'dag-pb', hash)
      await blocks.put(new Block(data, cid))
      const block = await blocks.get(cid.toV0())
      expect(block.data).toEqual(data)
    })

    it('throws when passed an invalid cid', async () => {
      try {
        await blocks.get('foo' as any)
        throw new Error('Should have thrown')
      } catch (err) {
        expect(err.message).toEqual('Not a valid CID')
      }
    })

    it('throws error when requesting CID that is not in the store', async () => {
      const data = Buffer.from(`TEST${Date.now()}`)
      const hash = await multihashing(data, 'sha2-256')
      const cid = new CID(1, 'dag-cbor', hash)

      await expect(blocks.get(cid)).rejects.toThrow('Not Found')
    })

    it('throws unknown error encountered when getting a block', async () => {
      const data = Buffer.from(`TEST${Date.now()}`)
      const hash = await multihashing(data, 'sha2-256')
      const cid = new CID(hash)
      const other = new BlockStore(new ExplodingStore())
      await expect(other.get(cid)).rejects.toThrow('error')
    })
  })

  describe('.has', () => {
    it('existing block', async () => {
      const exists = await blocks.has(b.cid)
      expect(exists).toEqual(true)
    })

    it('non existent block', async () => {
      const exists = await blocks.has(new CID('QmbcpFjzamCj5ZZdduW32ctWUPvbGMwQZk2ghWK6PrKswE'))
      expect(exists).toEqual(false)
    })

    it('should have block stored under v0 CID with a v1 CID', async () => {
      const data = Buffer.from(`TEST${Date.now()}`)
      const hash = await multihashing(data, 'sha2-256')
      const cid = new CID(hash)
      await blocks.put(new Block(data, cid))
      const exists = await blocks.has(cid.toV1())
      expect(exists).toEqual(true)
    })

    it('should have block stored under v1 CID with a v0 CID', async () => {
      const data = Buffer.from(`TEST${Date.now()}`)

      const hash = await multihashing(data, 'sha2-256')
      const cid = new CID(1, 'dag-pb', hash)
      await blocks.put(new Block(data, cid))
      const exists = await blocks.has(cid.toV0())
      expect(exists).toEqual(true)
    })

    it('throws when passed an invalid cid', async () => {
      await expect(blocks.has('foo' as any)).rejects.toThrow('Not a valid CID')
    })

    it('returns false when requesting non-dag-pb CID that is not in the store', async () => {
      const data = Buffer.from(`TEST${Date.now()}`)
      const hash = await multihashing(data, 'sha2-256')
      const cid = new CID(1, 'dag-cbor', hash)
      const result = await blocks.has(cid)

      expect(result).toBeFalsy()
    })
  })

  describe('.delete', () => {
    it('simple', async () => {
      await blocks.delete(b.cid)
      const exists = await blocks.has(b.cid)
      expect(exists).toEqual(false)
    })

    it('throws when passed an invalid cid', async () => {
      await expect(blocks.delete('foo' as any)).rejects.toThrow('Not a valid CID')
    })
  })

  describe('.query', () => {
    beforeAll(async () => {
      const data = Buffer.from(`TEST${Date.now()}`)
      const hash = await multihashing(data, 'sha2-256')
      const cid = new CID(1, 'dag-cbor', hash)
      blocks.put(new Block(data, cid))
    })
    it('simple', async () => {
      const results = blocks.query({})
      expect(results).toBeDefined()
      expect((await collect(results)).length).toBeGreaterThan(100)
    })

    it('empty when passed invalid filter', async () => {
      const results = blocks.query({
        filters: [() => false],
      })
      expect(results).toBeDefined()
      expect(await collect(results)).toHaveLength(0)
    })
  })
})
