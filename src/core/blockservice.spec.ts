import { expect } from "chai";
import CID from "cids";
import multihashing from "multihashing-async";
import { Buffer } from "buffer";
import { collect } from "streaming-iterables";
import { MemoryDatastore } from "interface-datastore";
import { BlockStore, Block, BlockService, Exchange } from "..";

let bs: BlockService;
let testBlocks: Block[];
const store = new BlockStore(new MemoryDatastore());

before(async function () {
  bs = new BlockService(store);

  const datas = [
    Buffer.from("1"),
    Buffer.from("2"),
    Buffer.from("3"),
    Buffer.from("A random data block"),
  ];

  testBlocks = await Promise.all(
    datas.map(async (data: Buffer) => {
      const hash = await multihashing(data, "sha2-256");
      return new Block(data, new CID(hash));
    })
  );
});

describe("fetch only from local repo", function () {
  it("store and get a block", async function () {
    const b = testBlocks[3];

    await bs.put(b);
    const res = await bs.get(b.cid);
    if (res) {
      expect(res.cid).to.eql(b.cid);
      expect(res.data).to.eql(b.data);
    }
  });

  it("get a non stored yet block", async function () {
    const b = testBlocks[2];

    try {
      await bs.get(b.cid);
    } catch (err) {
      expect(err).to.not.be.undefined;
    }
  });

  it("store many blocks", async function () {
    bs.putMany(testBlocks);
    for (const block of testBlocks) {
      expect(bs.store.has(block.cid)).to.be.ok;
    }
  });

  it("get many blocks through .get", async function () {
    await bs.putMany(testBlocks);
    const blocks = await Promise.all(
      testBlocks.map(async (b) => bs.get(b.cid))
    );
    expect(blocks).to.eql(testBlocks);
  });

  it("get many blocks through .getMany", async function () {
    const cids = testBlocks.map((b) => b.cid);
    await bs.putMany(testBlocks);
    const blocks = await collect(bs.getMany(cids));
    expect(blocks).to.eql(testBlocks);
  });

  it("delete a block", async function () {
    const data = Buffer.from("Will not live that much");

    const hash = await multihashing(data, "sha2-256");
    const b = { data, cid: new CID(hash) };

    await bs.put(b);
    await bs.delete(b.cid);
    const res = await bs.store.has(b.cid);
    expect(res).to.eql(false);
  });

  it("stores and gets lots of blocks", async function () {
    const datas = [...Array(1000)].map((_, i) => {
      return Buffer.from(`hello-${i}-${Math.random()}`);
    });

    const blocks = await Promise.all(
      datas.map(async (data) => {
        const hash = await multihashing(data, "sha2-256");
        return new Block(data, new CID(hash));
      })
    );

    await bs.putMany(blocks);

    const res = await Promise.all(blocks.map(async (b) => bs.get(b.cid)));
    expect(res).to.eql(blocks);
  });

  it("sets and unsets exchange", function () {
    bs = new BlockService(store);
    bs.exchange = {} as Exchange;
    expect(bs.online()).to.be.true;
    bs.exchange = undefined;
    expect(bs.online()).to.be.false;
  });
});

describe("fetch through Bitswap (has exchange)", function () {
  before(function () {
    bs = new BlockService(store);
  });

  it("online returns true when online", function () {
    bs.exchange = {} as Exchange;
    expect(bs.online()).to.be.true;
  });

  it("retrieves a block through bitswap", async function () {
    // returns a block with a value equal to its key
    const bitswap = {
      get(cid: CID) {
        return new Block(Buffer.from("secret"), cid);
      },
    };

    bs.exchange = (bitswap as unknown) as Exchange;

    const data = Buffer.from("secret");

    const hash = await multihashing(data, "sha2-256");
    const block = await bs.get(new CID(hash));
    expect(block).to.not.be.undefined;
    if (block) {
      expect(block.data).to.eql(data);
    }
  });

  it("puts the block through bitswap", async function () {
    const puts: Block[] = [];
    const bitswap = {
      put(block: Block) {
        puts.push(block);
      },
    };
    bs.exchange = (bitswap as unknown) as Exchange;

    const data = Buffer.from("secret sauce");

    const hash = await multihashing(data, "sha2-256");
    await bs.put(new Block(data, new CID(hash)));

    expect(puts).to.have.lengthOf(1);
  });
});
