/* eslint-disable @typescript-eslint/no-var-requires */
import { expect } from 'chai'
import { MemoryDatastore } from 'interface-datastore'
import CID from 'cids'
import { collect } from 'streaming-iterables'
import { DAGService } from './dagservice'
import { BlockService } from './blockservice'
import { BlockStore } from './blockstore'

const multihash = require('multihashes')
const dagPB = require('ipld-dag-pb')
const multihashing = require('multihashing-async')
const Block = require('@ipld/block')

let bs: BlockService
let resolver: DAGService
const store = new BlockStore(new MemoryDatastore())

before(async function() {
  bs = new BlockService(store)
})

describe('dag service basics...', function() {
  it('creates an instance', function() {
    resolver = new DAGService({ blockService: bs }) // Stick with defaults for now
    expect(resolver.blockService).to.not.be.undefined
  })

  describe('validation', function() {
    it('resolve - errors on unknown resolver', async function() {
      resolver = new DAGService({ blockService: bs })
      // choosing a format that is not supported
      const cid = new CID(1, 'blake2b-8', await multihashing(Buffer.from('abcd', 'hex'), 'sha1'))
      const result = resolver.resolve(cid, '')

      try {
        await result.next()
        expect(false).to.eql(true)
      } catch (err) {
        expect(err.message).to.eql('Not Found')
      }
    })

    it('put - errors on unknown resolver', async function() {
      resolver = new DAGService({ blockService: bs })
      // choosing a format that is not supported
      try {
        await resolver.put({ empty: undefined }, 'blake2b_8')
        expect(false).to.eql(true)
      } catch (err) {
        expect(err.message).to.eql('Unknown codec blake2b_8')
      }
    })

    it('put - errors on invalid/empty data', async function() {
      resolver = new DAGService({ blockService: bs })
      // choosing a format that is not supported
      try {
        await resolver.put(undefined, 'blake2b_8')
        expect(false).to.eql(true)
      } catch (err) {
        expect(err.message).to.eql('Block instances must be created with either an encode source or data')
      }
    })

    it('put - defaults to cbor if no format is provided', async function() {
      resolver = new DAGService({ blockService: bs })
      try {
        await resolver.put({ empty: undefined }, undefined)
      } catch (err) {
        expect(err.message).to.not.exist
      }
    })

    it('putMany - errors on unknown resolver', async function() {
      resolver = new DAGService({ blockService: bs })
      // choosing a format that is not supported
      const result = resolver.putMany([{ empty: undefined }], 'blake2b_8')
      try {
        await result.next()
        expect(false).to.eql(true)
      } catch (err) {
        expect(err.message).to.eql('Unknown codec blake2b_8')
      }
    })

    it('putMany - defaults to cbor if no format is provided', async function() {
      resolver = new DAGService({ blockService: bs })
      expect((await resolver.putMany([{ empty: undefined }], undefined).next()).value.codec).to.eql('dag-cbor')
    })

    it('tree - errors on unknown resolver', async function() {
      resolver = new DAGService({ blockService: bs })
      // choosing a format that is not supported
      const cid = new CID(1, 'blake2b-8', await multihashing(Buffer.from('abcd', 'hex'), 'sha1'))
      const result = resolver.tree(cid)
      try {
        await result.next()
        expect(false).to.eql(true)
      } catch (err) {
        expect(err.message).to.eql('Not Found')
      }
    })
  })
})

describe('dag service with dag-cbor', function() {
  let node1: any
  let node2: any
  let node3: any
  let cid1: CID
  let cid2: CID
  let cid3: CID

  before(async function() {
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
    const result = resolver.putMany(nodes, 'dag-cbor')
    const collected = await collect(result)
    cid1 = collected[0]
    cid2 = collected[1]
    cid3 = collected[2]
  })

  describe('public api', function() {
    it('resolver.put with format', async function() {
      const cid = await resolver.put(node1, 'dag-cbor')
      expect(cid.version).to.eql(1)
      expect(cid.codec).to.equal('dag-cbor')
      expect(cid.multihash).to.not.be.undefined
      const mh = multihash.decode(cid.multihash)
      expect(mh.name).to.equal('sha2-256')
    })

    it('resolver.put with format + hashAlg', async function() {
      const cid = await resolver.put(node1, 'dag-cbor', { hashAlg: 'sha3-512' })
      expect(cid).to.not.be.undefined
      expect(cid.version).to.eql(1)
      expect(cid.codec).to.eql('dag-cbor')
      expect(cid.multihash).to.not.be.undefined
      const mh = multihash.decode(cid.multihash)
      expect(mh.name).to.eql('sha3-512')
    })

    it('resolves value within 1st node scope', async function() {
      const result = resolver.resolve(cid1, 'someData')
      const node = (await result.next()).value
      expect(node.remainderPath).to.equal('')
      expect(node.value).to.eql('I am 1')
    })

    it('resolves value within nested scope (0 level)', async function() {
      const result = resolver.resolve(cid2, 'one')
      const [node1, node2] = await collect(result)

      expect(node1.remainderPath).to.eql('')
      expect(node1.value).to.eql(cid1)

      expect(node2.remainderPath).to.eql('')
      expect(node2.value).to.eql({ someData: 'I am 1' })
    })

    it('resolves value within nested scope (1 level)', async function() {
      const result = resolver.resolve(cid2, 'one/someData')
      const [node1, node2] = await collect(result)

      expect(node1.remainderPath).to.eql('someData')
      expect(node1.value).to.eql(cid1)

      expect(node2.remainderPath).to.eql('')
      expect(node2.value).to.eql('I am 1')
    })

    it('resolves value within nested scope (2 levels)', async function() {
      const result = resolver.resolve(cid3, 'two/one/someData')
      const [node1, node2, node3] = await collect(result)

      expect(node1.remainderPath).to.eql('one/someData')
      expect(node1.value).to.eql(cid2)

      expect(node2.remainderPath).to.eql('someData')
      expect(node2.value).to.eql(cid1)

      expect(node3.remainderPath).to.equal('')
      expect(node3.value).to.eql('I am 1')
    })

    it('fails resolving unavailable path', async function() {
      const result = resolver.resolve(cid3, `foo/${Date.now()}`)
      try {
        await result.next()
        expect(false).to.eql(true)
      } catch (err) {
        expect(err.message).to.eql('Object has no property foo')
      }
    })

    it('resolver.get round-trip', async function() {
      const cid = await resolver.put(node1, 'dag-cbor')
      const node = await resolver.get(cid)
      expect(node).to.eql(node1)
    })

    it('resolver.tree', async function() {
      const result = resolver.tree(cid3)
      const paths = await collect(result)
      expect(paths).to.eql(['one', 'two', 'someData'])
    })

    it('resolver.tree with exist()ent path', async function() {
      const result = resolver.tree(cid3, 'one')
      const paths = await collect(result)
      expect(paths).to.eql([])
    })

    it('resolver.tree with non exist()ent path', async function() {
      const result = resolver.tree(cid3, 'bananas')
      const paths = await collect(result)
      expect(paths).to.eql([])
    })

    it('resolver.tree recursive', async function() {
      const result = resolver.tree(cid3, undefined, { recursive: true })
      const paths = await collect(result)
      expect(paths).to.eql(['one', 'two', 'someData', 'one/someData', 'two/one', 'two/someData', 'two/one/someData'])
    })

    it('resolver.tree with existent path recursive', async function() {
      const result = resolver.tree(cid3, 'two', { recursive: true })
      const paths = await collect(result)
      expect(paths).to.eql(['one', 'someData', 'one/someData'])
    })

    it('resolver.remove', async function() {
      const cid = await resolver.put(node1, 'dag-cbor')
      const sameAsNode1 = await resolver.get(cid)
      expect(sameAsNode1).to.eql(node1)

      const remove = async function() {
        // Verify that the item got really deleted
        try {
          await resolver.remove(cid)
          await resolver.get(cid)
          expect(false).to.eql(true)
        } catch (err) {
          expect(err).to.exist
        }
      }
      return remove()
    })
  })
})

describe('dag service with dag-pb', function() {
  let node1: any
  let node2: any
  let node3: any
  let cid1: CID
  let cid2: CID
  let cid3: CID

  before(async function() {
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
    const result = resolver.putMany(nodes, 'dag-pb')
    ;[cid1, cid2, cid3] = await collect(result)
  })

  describe('public api', function() {
    it('resolver.put with format', async function() {
      const cid = await resolver.put(node1, 'dag-pb')
      expect(cid.version).to.eql(1)
      expect(cid.codec).to.eql('dag-pb')
      expect(cid.multihash).to.not.be.undefined
      const mh = multihash.decode(cid.multihash)
      expect(mh.name).to.eql('sha2-256')
    })

    it('resolver.put with format + hashAlg', async function() {
      const cid = await resolver.put(node1, 'dag-pb', { hashAlg: 'sha3-512' })
      expect(cid.version).to.eql(1)
      expect(cid.codec).to.eql('dag-pb')
      expect(cid.multihash).to.not.be.undefined
      const mh = multihash.decode(cid.multihash)
      expect(mh.name).to.eql('sha3-512')
    })

    it('resolves a value within 1st node scope', async function() {
      const result = resolver.resolve(cid1, 'Data')
      const node = (await result.next()).value
      expect(node.remainderPath).to.eql('')
      expect(node.value).to.eql(Buffer.from('I am 1'))
    })

    it('resolves a value within nested scope (1 level)', async function() {
      const result = resolver.resolve(cid2, 'Links/0/Hash/Data')
      const [node1, node2] = await collect(result)

      expect(node1.remainderPath).to.eql('Data')
      expect(node1.value).to.eql(cid1)

      expect(node2.remainderPath).to.eql('')
      expect(node2.value).to.eql(Buffer.from('I am 1'))
    })

    it('resolves value within nested scope (2 levels)', async function() {
      const result = resolver.resolve(cid3, 'Links/1/Hash/Links/0/Hash/Data')
      const [node1, node2, node3] = await collect(result)

      expect(node1.remainderPath).to.eql('Links/0/Hash/Data')
      expect(node1.value).to.eql(cid2)

      expect(node2.remainderPath).to.eql('Data')
      expect(node2.value).to.eql(cid1)

      expect(node3.remainderPath).to.eql('')
      expect(node3.value).to.eql(Buffer.from('I am 1'))
    })

    it('resolves value within nested scope (2 levels) with named links', async function() {
      const result = resolver.resolve(cid3, '2/1/Data')
      const collected = await collect(result)
      expect(collected).to.have.length(3)
      const node1 = collected[0]
      const node2 = collected[1]
      const node3 = collected[2]

      expect(node1.remainderPath).to.eql('1/Data')
      expect(node1.value).to.eql(cid2)

      expect(node2.remainderPath).to.eql('Data')
      expect(node2.value).to.eql(cid1)

      expect(node3.remainderPath).to.eql('')
      expect(node3.value).to.eql(Buffer.from('I am 1'))
    })

    it('resolver.get round-trip', async function() {
      const cid = await resolver.put(node1, 'dag-pb')
      const node = await resolver.get(cid)
      // `size` is lazy, without a call to it a deep equal check would fail
      const _ = node.size
      expect(node as any).to.deep.equal(node1 as any)
    })

    it('resolver.remove', async function() {
      const node = new dagPB.DAGNode(Buffer.from('a dag-pb node'))
      const cid = await resolver.put(node, 'dag-pb')
      const sameAsNode = await resolver.get(cid)
      // `size` is lazy, without a call to it a deep equal check would fail
      const _ = sameAsNode.size
      expect(sameAsNode.data).to.deep.equal(node.data)

      async function remove() {
        try {
          await resolver.remove(cid)
          await resolver.get(cid)
          expect(false).to.eql(true)
        } catch (err) {
          expect(err).to.exist
        }
      }
      return remove()
    })

    it('should return a v0 CID when specified', async function() {
      const cid = await resolver.put(Buffer.from('a dag-pb node'), 'dag-pb', { cidVersion: 0 })

      expect(cid.version).to.eql(0)
    })

    it('should return a v1 CID when specified', async function() {
      const cid = await resolver.put(Buffer.from('a dag-pb node'), 'dag-pb', { cidVersion: 1 })

      expect(cid.version).to.eql(1)
    })
  })
})
