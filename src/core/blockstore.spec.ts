/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect } from "chai";
import multiformats from "multiformats/basics.js";
import {
  Key,
  MemoryDatastore,
  Query,
  Datastore,
  Pair,
} from "interface-datastore";
import multihashing from "multihashing-async";
import { collect } from "streaming-iterables";
import { Block, BlockStore } from "./blockstore";

const { CID } = multiformats;

let blocks: BlockStore;

const encoder = new TextEncoder();

class ExplodingStore implements Datastore<Uint8Array> {
  commitInvoked: boolean;
  putInvoked: boolean;
  constructor() {
    this.commitInvoked = false;
    this.putInvoked = false;
  }
  putMany(
    source: AsyncIterable<Pair<Uint8Array>> | Iterable<Pair<Uint8Array>>
  ): AsyncIterableIterator<Pair<Uint8Array>> {
    throw new Error("Method not implemented.");
  }
  getMany(
    source: AsyncIterable<Key> | Iterable<Key>
  ): AsyncIterableIterator<Uint8Array> {
    throw new Error("Method not implemented.");
  }
  deleteMany(
    source: AsyncIterable<Key> | Iterable<Key>
  ): AsyncIterableIterator<Key> {
    throw new Error("Method not implemented.");
  }
  async close() {
    return;
  }
  async has(_key: Key) {
    return true;
  }
  async get(_key: Key): Promise<Uint8Array> {
    throw new Error("error");
  }
  batch() {
    return {
      put: async (key: Key, value: Uint8Array) => {
        this.putInvoked = true;
      },
      commit: async () => {
        this.commitInvoked = true;
      },
      delete: async (key: Key) => {
        return;
      },
    };
  }
  async open() {
    return;
  }
  async put(key: Key, value: Uint8Array) {
    return;
  }
  async delete(key: Key) {
    return;
  }
  async *query(query: Query<Uint8Array>) {
    yield { key: new Key(""), value: encoder.encode("data") };
  }
}

before(async function () {
  blocks = new BlockStore(new MemoryDatastore());
});

describe("BlockStore", function () {
  it("converts a CID to a datastore Key and back", function () {
    const originalCid = new CID(
      "Qme6KJdKcp85TYbLxuLV7oQzMiLremD7HMoXLZEmgo6Rnh"
    );
    const key = BlockStore.cidToKey(originalCid);
    expect(key instanceof Key).to.be.true;
    const cid = BlockStore.keyToCid(key);
    expect(cid instanceof CID).to.be.true;
    // We'll always get back a v1 CID, so use toV0 to compare
    expect(cid.toV0().toString()).to.eql(originalCid.toString());
  });

  const blockData = [...Array(100).keys()].map((i) =>
    encoder.encode(`hello-${i}-${Math.random()}`)
  );
  const bData = encoder.encode("hello world");
  let b: Block;

  before(async function () {
    const hash = await multihashing(bData, "sha2-256");
    b = new Block(bData, new CID(hash));
  });

  describe(".put", function () {
    let other: BlockStore;

    it("simple", async function () {
      await blocks.put(b);
    });

    it("multi write (locks)", async function () {
      await Promise.all([blocks.put(b), blocks.put(b)]);
    });

    it("empty value", async function () {
      const d = new Uint8Array(0);
      const multihash = await multihashing(d, "sha2-256");
      const empty = new Block(d, new CID(multihash));
      await blocks.put(empty);
    });

    it("massive multiwrite", async function () {
      const hashes = await Promise.all(
        blockData.map((b) => multihashing(b, "sha2-256"))
      );
      await Promise.all(
        blockData.map((b: Uint8Array, i: number) => {
          const block = new Block(b, new CID(hashes[i]));
          return blocks.put(block);
        })
      );
    });

    it(".putMany", async function () {
      const blks = await Promise.all(
        [...Array(50).keys()].map(async function () {
          const d = encoder.encode("many" + Math.random());
          const hash = await multihashing(d, "sha2-256");
          return new Block(d, new CID(hash));
        })
      );
      await blocks.putMany(blks);
      for (const block of blks) {
        const block1 = await blocks.get(block.cid);
        expect(block1).to.eql(block);
      }
    });

    it("should not .putMany when block is already present", async function () {
      const data = encoder.encode(`TEST${Date.now()}`);
      const hash = await multihashing(data, "sha2-256");
      const cid = new CID(hash);
      const store = new ExplodingStore();
      other = new BlockStore(store);

      await other.putMany([
        {
          cid,
          data,
        },
      ]);

      expect(store.putInvoked).to.be.false;
      expect(store.commitInvoked).to.be.true;
    });

    it("returns an error on invalid block", async function () {
      try {
        await blocks.put("hello" as never);
        throw new Error("Shoudl have thrown error on invalid block");
      } catch (err) {
        expect(err).to.not.be.undefined;
      }
    });
  });

  describe(".get", function () {
    let other: BlockStore;

    it("simple", async function () {
      const block = await blocks.get(b.cid);
      expect(block).to.eql(b);
    });

    it("massive read", async function () {
      await Promise.all(
        [...Array(20 * 100).keys()].map(async (i) => {
          const j = i % blockData.length;
          const hash = await multihashing(blockData[j], "sha2-256");
          const block = await blocks.get(new CID(hash));
          expect(block.data).to.eql(blockData[j]);
        })
      );
    });

    it("returns an error on invalid block", async function () {
      try {
        await blocks.get("woot" as never);
      } catch (err) {
        expect(err).to.not.be.undefined;
        return;
      }
      throw new Error("Shoudl have thrown error on invalid block");
    });

    it("should get block stored under v0 CID with a v1 CID", async function () {
      const data = encoder.encode(`TEST${Date.now()}`);
      const hash = await multihashing(data, "sha2-256");
      const cid = new CID(hash);
      await blocks.put(new Block(data, cid));
      const block = await blocks.get(cid.toV1());
      expect(block.data).to.eql(data);
    });

    it("throws when passed an invalid cid", async function () {
      try {
        await blocks.get("foo" as never);
        throw new Error("Should have thrown");
      } catch (err) {
        expect(err.message).to.eql("Not a valid CID");
      }
    });

    it("throws error when requesting CID that is not in the store", async function () {
      const data = encoder.encode(`TEST${Date.now()}`);
      const hash = await multihashing(data, "sha2-256");
      const cid = new CID(1, 113, hash);
      try {
        await blocks.get(cid);
        expect(false).to.eql(true);
      } catch (err) {
        expect(err.message).to.eql("Not Found");
      }
    });

    it("throws unknown error encountered when getting a block", async function () {
      const data = encoder.encode(`TEST${Date.now()}`);
      const hash = await multihashing(data, "sha2-256");
      const cid = new CID(hash);
      const other = new BlockStore(new ExplodingStore());

      try {
        await other.get(cid);
        expect(false).to.eql(true);
      } catch (err) {
        expect(err).to.exist;
      }
    });
  });

  describe(".has", function () {
    it("existing block", async function () {
      const exists = await blocks.has(b.cid);
      expect(exists).to.eql(true);
    });

    it("non existent block", async function () {
      const exists = await blocks.has(
        new CID("QmbcpFjzamCj5ZZdduW32ctWUPvbGMwQZk2ghWK6PrKswE")
      );
      expect(exists).to.eql(false);
    });

    it("throws when passed an invalid cid", async function () {
      try {
        await blocks.has("foo" as never);
        expect(false).to.eql(true);
      } catch (err) {
        expect(err.message).to.eql("Not a valid CID");
      }
    });

    it("returns false when requesting non-dag-pb CID that is not in the store", async function () {
      const data = encoder.encode(`TEST${Date.now()}`);
      const hash = await multihashing(data, "sha2-256");
      const cid = new CID(1, 113, hash);
      const result = await blocks.has(cid);

      expect(result).to.be.false;
    });
  });

  describe(".delete", function () {
    it("simple", async function () {
      await blocks.delete(b.cid);
      const exists = await blocks.has(b.cid);
      expect(exists).to.eql(false);
    });

    it("throws when passed an invalid cid", async function () {
      try {
        await blocks.delete("foo" as never);
        expect(false).to.eql(true);
      } catch (err) {
        expect(err.message).to.eql("Not a valid CID");
      }
    });
  });

  describe(".query", function () {
    before(async function () {
      const data = encoder.encode(`TEST${Date.now()}`);
      const hash = await multihashing(data, "sha2-256");
      const cid = new CID(1, 113, hash);
      blocks.put(new Block(data, cid));
    });
    it("simple", async function () {
      const results = blocks.query({});
      expect(results).to.not.be.undefined;
      expect((await collect(results)).length).to.be.greaterThan(100);
    });

    it("empty when passed invalid filter", async function () {
      const results = blocks.query({
        filters: [() => false],
      });
      expect(results).to.not.be.undefined;
      expect(await collect(results)).to.have.lengthOf(0);
    });
  });
});
