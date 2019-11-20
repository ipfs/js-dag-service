import { MemoryDatastore } from 'interface-datastore'
import { BlockStore, BlockService } from '../src'
import { DAGService } from '../src/core'
import CID from 'cids'
import multihashing from 'multihashing-async'
import Block from '@ipld/block'
import { collect } from 'streaming-iterables'
const multihash = require('multihashes')
const dagPB = require('ipld-dag-pb')

let bs: BlockService
let resolver: DAGService
const store = new BlockStore(new MemoryDatastore())

beforeAll(async () => {
  bs = new BlockService(store)
})

describe('dag service basics...', () => {
  it('creates an instance', () => {
    resolver = new DAGService({ blockService: bs}) // Stick with defaults for now
    expect(resolver.blockService).toBeDefined()
  })

  describe('validation', () => {
    it('resolve - errors on unknown resolver', async () => {
      resolver = new DAGService({ blockService: bs })
      // choosing a format that is not supported
      const cid = new CID(1, 'blake2b-8', await multihashing(Buffer.from('abcd', 'hex'), 'sha1'))
      const result = resolver.resolve(cid, '')
      await expect(result.next()).rejects.toThrowError('Not Found')
    })

    it('put - errors on unknown resolver', async () => {
      resolver = new DAGService({ blockService: bs })
      // choosing a format that is not supported
      await expect(resolver.put({ empty: undefined }, 'blake2b_8')).rejects.toThrowError('Unknown codec blake2b_8')
    })

    it('put - errors on invalid/empty data', async () => {
      resolver = new DAGService({ blockService: bs })
      // choosing a format that is not supported
      await expect(resolver.put(undefined, 'blake2b_8')).rejects.toThrowError('Block instances must be created with either an encode source or data')
    })

    it('put - defaults to cbor if no format is provided', async () => {
      resolver = new DAGService({ blockService: bs })
      expect((await resolver.put({ empty: undefined }, undefined)).codec).toEqual('dag-cbor')
    })

    it('putMany - errors on unknown resolver', async () => {
      resolver = new DAGService({ blockService: bs })
      // choosing a format that is not supported
      const result = resolver.putMany([{ empty: undefined }], 'blake2b_8')
      await expect(result.next()).rejects.toThrowError('Unknown codec blake2b_8')
    })

    it('putMany - defaults to cbor if no format is provided', async () => {
      resolver = new DAGService({ blockService: bs })
      expect((await resolver.putMany([{ empty: undefined }], undefined).next()).value.codec).toEqual('dag-cbor')
    })

    it('tree - errors on unknown resolver', async () => {
      resolver = new DAGService({ blockService: bs })
      // choosing a format that is not supported
      const cid = new CID(1, 'blake2b-8', await multihashing(Buffer.from('abcd', 'hex'), 'sha1')
      )
      const result = resolver.tree(cid)
      await expect(result.next()).rejects.toThrowError('Not Found')
    })
  })
})

describe('dag service with dag-cbor', () => {
  let node1: any
  let node2: any
  let node3: any
  let cid1: CID
  let cid2: CID
  let cid3: CID

  beforeAll(async () => {
    resolver = new DAGService({ blockService: bs })

    node1 = { someData: 'I am 1' }
    const serialized1 = Block.encoder(node1, 'dag-cbor')
    cid1 = await serialized1.cid()
    node2 = {
      someData: 'I am 2',
      one: cid1,
    }
    const serialized2 = Block.encoder(node2, 'dag-cbor')
    cid2 = await serialized2.cid()
    node3 = {
      someData: 'I am 3',
      one: cid1,
      two: cid2,
    }
    const serialized3 = Block.encoder(node3, 'dag-cbor')
    cid3 = await serialized3.cid()

    const nodes = [node1, node2, node3]
    const result = resolver.putMany(nodes, 'dag-cbor');
    [cid1, cid2, cid3] = await collect(result)
  })

  describe('public api', () => {
    it('resolver.put with format', async () => {
      const cid = await resolver.put(node1, 'dag-cbor')
      expect(cid.version).toEqual(1)
      expect(cid.codec).toEqual('dag-cbor')
      expect(cid.multihash).toBeDefined()
      const mh = multihash.decode(cid.multihash)
      expect(mh.name).toEqual('sha2-256')
    })

    it('resolver.put with format + hashAlg', async () => {
      const cid = await resolver.put(node1, 'dag-cbor', { hashAlg: 'sha3-512' })
      expect(cid).toBeDefined()
      expect(cid.version).toEqual(1)
      expect(cid.codec).toEqual('dag-cbor')
      expect(cid.multihash).toBeDefined()
      const mh = multihash.decode(cid.multihash)
      expect(mh.name).toEqual('sha3-512')
    })

    it('resolves value within 1st node scope', async () => {
      const result = resolver.resolve(cid1, 'someData')
      const node = (await result.next()).value
      expect(node.remainderPath).toEqual('')
      expect(node.value).toEqual('I am 1')
    })

    it('resolves value within nested scope (0 level)', async () => {
      const result = resolver.resolve(cid2, 'one')
      const [node1, node2] = await collect(result)

      expect(node1.remainderPath).toEqual('')
      expect(node1.value).toEqual(cid1)

      expect(node2.remainderPath).toEqual('')
      expect(node2.value).toEqual({ someData: 'I am 1' })
    })

    it('resolves value within nested scope (1 level)', async () => {
      const result = resolver.resolve(cid2, 'one/someData')
      const [node1, node2] = await collect(result)

      expect(node1.remainderPath).toEqual('someData')
      expect(node1.value).toEqual(cid1)

      expect(node2.remainderPath).toEqual('')
      expect(node2.value).toEqual('I am 1')
    })

    it('resolves value within nested scope (2 levels)', async () => {
      const result = resolver.resolve(cid3, 'two/one/someData')
      const [node1, node2, node3] = await collect(result)

      expect(node1.remainderPath).toEqual('one/someData')
      expect(node1.value).toEqual(cid2)

      expect(node2.remainderPath).toEqual('someData')
      expect(node2.value).toEqual(cid1)

      expect(node3.remainderPath).toEqual('')
      expect(node3.value).toEqual('I am 1')
    })

    it('fails resolving unavailable path', async () => {
      const result = resolver.resolve(cid3, `foo/${Date.now()}`)
      await expect(result.next()).rejects.toThrowError("Object has no property foo")
    })

    it('resolver.get round-trip', async () => {
      const cid = await resolver.put(node1, 'dag-cbor')
      const node = await resolver.get(cid)
      expect(node).toEqual(node1)
    })

    it('resolver.tree', async () => {
      const result = resolver.tree(cid3)
      const paths = await collect(result)
      expect(paths).toEqual(['one', 'two', 'someData'])
    })

    it('resolver.tree with exist()ent path', async () => {
      const result = resolver.tree(cid3, 'one')
      const paths = await collect(result)
      expect(paths).toEqual([])
    })

    it('resolver.tree with non exist()ent path', async () => {
      const result = resolver.tree(cid3, 'bananas')
      const paths = await collect(result)
      expect(paths).toEqual([])
    })

    it('resolver.tree recursive', async () => {
      const result = resolver.tree(cid3, undefined, { recursive: true })
      const paths = await collect(result)
      expect(paths).toEqual(['one', 'two', 'someData', 'one/someData', 'two/one', 'two/someData', 'two/one/someData'])
    })

    it('resolver.tree with existent path recursive', async () => {
      const result = resolver.tree(cid3, 'two', { recursive: true })
      const paths = await collect(result)
      expect(paths).toEqual(['one', 'someData', 'one/someData'])
    })

    it('resolver.remove', async () => {
      const cid = await resolver.put(node1, 'dag-cbor')
      const sameAsNode1 = await resolver.get(cid)
      expect(sameAsNode1).toEqual(node1)
      return remove()

      async function remove() {
        await resolver.remove(cid)
        // Verify that the item got really deleted
        expect(resolver.get(cid)).rejects.toThrowError()
      }
    })
  })
})

describe('dag service with dag-pb', () => {
  let node1: any
  let node2: any
  let node3: any
  let cid1: CID
  let cid2: CID
  let cid3: CID

  beforeAll(async () => {
    resolver = new DAGService({ blockService: bs })

    node1 = new dagPB.DAGNode(Buffer.from('I am 1'))
    node2 = new dagPB.DAGNode(Buffer.from('I am 2'))
    node3 = new dagPB.DAGNode(Buffer.from('I am 3'))
    const serialized1 = dagPB.util.serialize(node1)
    cid1 = await dagPB.util.cid(serialized1)
    node2.addLink({
      name: '1',
      size: node1.Tsize,
      cid: cid1,
    })
    node3.addLink({
      name: '1',
      size: node1.size,
      cid: cid1,
    })
    const serialized2 = dagPB.util.serialize(node2)
    cid2 = await dagPB.util.cid(serialized2)
    node3.addLink({
      name: '2',
      size: node2.size,
      cid: cid2,
    })


    const nodes = [node1, node2, node3]
    const result = resolver.putMany(nodes, 'dag-pb');
    [cid1, cid2, cid3] = await collect(result)
  })

  describe('public api', () => {
    it('resolver.put with format', async () => {
      const cid = await resolver.put(node1, 'dag-pb')
      expect(cid.version).toEqual(1)
      expect(cid.codec).toEqual('dag-pb')
      expect(cid.multihash).toBeDefined()
      const mh = multihash.decode(cid.multihash)
      expect(mh.name).toEqual('sha2-256')
    })

    it('resolver.put with format + hashAlg', async () => {
      const cid = await resolver.put(node1, 'dag-pb', { hashAlg: 'sha3-512' })
      expect(cid.version).toEqual(1)
      expect(cid.codec).toEqual('dag-pb')
      expect(cid.multihash).toBeDefined()
      const mh = multihash.decode(cid.multihash)
      expect(mh.name).toEqual('sha3-512')
    })

    it('resolves a value within 1st node scope', async () => {
      const result = resolver.resolve(cid1, 'Data')
      const node = (await result.next()).value
      expect(node.remainderPath).toEqual('')
      expect(node.value).toEqual(Buffer.from('I am 1'))
    })

    it('resolves a value within nested scope (1 level)', async () => {
      const result = resolver.resolve(cid2, 'Links/0/Hash/Data')
      const [node1, node2] = await collect(result)

      expect(node1.remainderPath).toEqual('Data')
      expect(node1.value.equals(cid1)).toBeTruthy()

      expect(node2.remainderPath).toEqual('')
      expect(node2.value).toEqual(Buffer.from('I am 1'))
    })

    it('resolves value within nested scope (2 levels)', async () => {
      const result = resolver.resolve(cid3, 'Links/1/Hash/Links/0/Hash/Data')
      const [node1, node2, node3] = await collect(result)

      expect(node1.remainderPath).toEqual('Links/0/Hash/Data')
      expect(node1.value.equals(cid2)).toBeTruthy()

      expect(node2.remainderPath).toEqual('Data')
      expect(node2.value.equals(cid1)).toBeTruthy()

      expect(node3.remainderPath).toEqual('')
      expect(node3.value).toEqual(Buffer.from('I am 1'))
    })

    it('resolves value within nested scope (2 levels) with named links', async () => {
      const result = resolver.resolve(cid3, '2/1/Data')
      const [node1, node2, node3] = await collect(result)

      expect(node1.remainderPath).toEqual('1/Data')
      expect(node1.value.equals(cid2)).toBeTruthy()

      expect(node2.remainderPath).toEqual('Data')
      expect(node2.value.equals(cid1)).toBeTruthy()

      expect(node3.remainderPath).toEqual('')
      expect(node3.value).toEqual(Buffer.from('I am 1'))
    })

    it('resolver.get round-trip', async () => {
      const cid = await resolver.put(node1, 'dag-pb')
      const node = await resolver.get(cid)
      // `size` is lazy, without a call to it a deep equal check would fail
      const _ = node.size // eslint-disable-line no-unused-vars
      expect(node).toMatchObject(node1)
    })

    it('resolver.remove', async () => {
      const node = new dagPB.DAGNode(Buffer.from('a dag-pb node'))
      const cid = await resolver.put(node, 'dag-pb')
      const sameAsNode = await resolver.get(cid)
      // `size` is lazy, without a call to it a deep equal check would fail
      const _ = sameAsNode.size // eslint-disable-line no-unused-vars
      expect(sameAsNode.data).toEqual(node.data)
      return remove()

      async function remove() {
        await resolver.remove(cid)
        // Verify that the item got really deleted
        await expect(resolver.get(cid)).rejects.toThrowError()
      }
    })

    it('should return a v0 CID when specified', async () => {
      const cid = await resolver.put(Buffer.from('a dag-pb node'), 'dag-pb', { cidVersion: 0 })

      expect(cid.version).toEqual(0)
    })

    it('should return a v1 CID when specified', async () => {
      const cid = await resolver.put(Buffer.from('a dag-pb node'), 'dag-pb', { cidVersion: 1 })

      expect(cid.version).toEqual(1)
    })
  })
})
