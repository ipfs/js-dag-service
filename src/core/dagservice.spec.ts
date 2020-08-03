/* eslint-disable @typescript-eslint/no-var-requires */
import { expect } from "chai";
import { MemoryDatastore } from "interface-datastore";
import { Buffer } from "buffer";
import { BlockStore, BlockService } from "..";
import { DAGService } from ".";
import multihashing from "multihashing-async";
import { Block } from "../utils";
import { collect } from "streaming-iterables";
import multiformats, { CID } from "multiformats/basics.js";

const multihash = require("multihashes");
const { util, DAGNode } = require("ipld-dag-pb");

// @todo: Once this is more readily available, import as a module?
// Start dag-pb codec
const {
  util: { serialize, deserialize },
  // eslint-disable-next-line @typescript-eslint/no-var-requires
} = require("ipld-dag-pb");
const dagpb = {
  encode: serialize,
  decode: (buffer: Buffer) => deserialize(Buffer.from(buffer)),
  code: 0x70,
  name: "dag-pb",
};
multiformats.multicodec.add(dagpb);
// End dag-pb codec

let bs: BlockService;
let resolver: DAGService;
const store = new BlockStore(new MemoryDatastore());

before(async function () {
  bs = new BlockService(store);
});

describe("dag service basics...", function () {
  it("creates an instance", function () {
    resolver = new DAGService({ blockService: bs }); // Stick with defaults for now
    expect(resolver.blockService).to.not.be.undefined;
  });

  describe("validation", function () {
    it("resolve - errors on unknown resolver", async function () {
      resolver = new DAGService({ blockService: bs });
      // choosing a format that is not supported
      const cid = new CID(
        1,
        45569, // blake2b-8
        await multihashing(Buffer.from("abcd", "hex"), "sha1")
      );
      const result = resolver.resolve(cid, "");

      try {
        await result.next();
        expect(false).to.eql(true);
      } catch (err) {
        expect(err.message).to.eql("Not Found");
      }
    });

    it("put - errors on unknown resolver", async function () {
      resolver = new DAGService({ blockService: bs });
      // choosing a format that is not supported
      try {
        await resolver.put({ empty: undefined }, "blake2b_8");
        expect(false).to.eql(true);
      } catch (err) {
        expect(err.message).to.eql(
          `Do not have multiformat entry for "blake2b_8"`
        );
      }
    });

    it("put - errors on invalid/empty data", async function () {
      resolver = new DAGService({ blockService: bs });
      // choosing a format that is not supported
      try {
        await resolver.put(undefined, "blake2b_8");
        expect(false).to.eql(true);
      } catch (err) {
        expect(err.message).to.eql(
          "Block instances must be created with either an encode source or data"
        );
      }
    });

    it("put - defaults to cbor if no format is provided", async function () {
      resolver = new DAGService({ blockService: bs });
      try {
        await resolver.put({ empty: undefined }, undefined);
      } catch (err) {
        expect(err.message).to.not.exist;
      }
    });

    it("putMany - errors on unknown resolver", async function () {
      resolver = new DAGService({ blockService: bs });
      // choosing a format that is not supported
      const result = resolver.putMany([{ empty: undefined }], "blake2b_8");
      try {
        await result.next();
        expect(false).to.eql(true);
      } catch (err) {
        expect(err.message).to.eql(
          `Do not have multiformat entry for "blake2b_8"`
        );
      }
    });

    it("putMany - defaults to cbor if no format is provided", async function () {
      resolver = new DAGService({ blockService: bs });
      expect(
        (await resolver.putMany([{ empty: undefined }], undefined).next()).value
          .code
      ).to.eql(113);
    });

    it("tree - errors on unknown resolver", async function () {
      resolver = new DAGService({ blockService: bs });
      // choosing a format that is not supported
      const cid = new CID(
        1,
        45569, // blake2b-8
        await multihashing(Buffer.from("abcd", "hex"), "sha1")
      );
      const result = resolver.tree(cid);
      try {
        await result.next();
        expect(false).to.eql(true);
      } catch (err) {
        expect(err.message).to.eql("Not Found");
      }
    });
  });
});

describe("dag service with dag-cbor", function () {
  let node1: Record<string, string | CID>;
  let node2: Record<string, string | CID>;
  let node3: Record<string, string | CID>;
  let cid1: CID;
  let cid2: CID;
  let cid3: CID;

  before(async function () {
    resolver = new DAGService({ blockService: bs });

    node1 = { someData: "I am 1" };
    const serialized1 = Block.encoder(node1, "dag-cbor");
    cid1 = await serialized1.cid();
    node2 = {
      someData: "I am 2",
      one: cid1,
    };
    const serialized2 = Block.encoder(node2, "dag-cbor");
    cid2 = await serialized2.cid();
    node3 = {
      someData: "I am 3",
      one: cid1,
      two: cid2,
    };
    const serialized3 = Block.encoder(node3, "dag-cbor");
    cid3 = await serialized3.cid();

    const nodes = [node1, node2, node3];
    const result = resolver.putMany(nodes, "dag-cbor");
    const collected = await collect(result);
    cid1 = collected[0];
    cid2 = collected[1];
    cid3 = collected[2];
  });

  describe("public api", function () {
    it("resolver.put with format", async function () {
      const cid = await resolver.put(node1, "dag-cbor");
      expect(cid.version).to.eql(1);
      expect(cid.code).to.equal(113);
      expect(cid.multihash).to.not.be.undefined;
      const mh = multihash.decode(Buffer.from(cid.multihash));
      expect(mh.name).to.equal("sha2-256");
    });

    it("resolver.put with format + hashAlg", async function () {
      const cid = await resolver.put(node1, "dag-cbor", {
        hashAlg: "sha2-512",
      });
      expect(cid).to.not.be.undefined;
      expect(cid.version).to.eql(1);
      // @todo: Get this code directly from the multicodec package
      expect(cid.code).to.eql(113);
      expect(cid.multihash).to.not.be.undefined;
      const mh = multihash.decode(Buffer.from(cid.multihash));
      expect(mh.name).to.eql("sha2-512");
    });

    it("resolves value within 1st node scope", async function () {
      const result = resolver.resolve(cid1, "/someData");
      const node = (await result.next()).value;
      expect(node.remainderPath).to.equal("");
      expect(node.value).to.eql("I am 1");
    });

    it("resolves value within nested scope (0 level)", async function () {
      const result = resolver.resolve(cid2, "/one");
      const [node1, node2] = await collect(result);

      expect(node1.remainderPath).to.eql("");
      expect(node1.value).to.eql(cid1);

      expect(node2.remainderPath).to.eql("");
      expect(node2.value).to.eql({ someData: "I am 1" });
    });

    it("resolves value within nested scope (1 level)", async function () {
      const result = resolver.resolve(cid2, "/one/someData");
      const [node1, node2] = await collect(result);

      expect(node1.remainderPath).to.eql("someData");
      expect(node1.value).to.eql(cid1);

      expect(node2.remainderPath).to.eql("");
      expect(node2.value).to.eql("I am 1");
    });

    it("resolves value within nested scope (2 levels)", async function () {
      const result = resolver.resolve(cid3, "/two/one/someData");
      const [node1, node2, node3] = await collect(result);

      expect(node1.remainderPath).to.eql("one/someData");
      expect(node1.value).to.eql(cid2);

      expect(node2.remainderPath).to.eql("someData");
      expect(node2.value).to.eql(cid1);

      expect(node3.remainderPath).to.equal("");
      expect(node3.value).to.eql("I am 1");
    });

    it("fails resolving unavailable path", async function () {
      const result = resolver.resolve(cid3, `foo/${Date.now()}`);
      try {
        await result.next();
        expect(false).to.eql(true);
      } catch (err) {
        expect(err.message).to.eql("Object has no property foo");
      }
    });

    it("resolver.get round-trip", async function () {
      const cid = await resolver.put(node1, "dag-cbor");
      const node = await resolver.get(cid);
      expect(node).to.eql(node1);
    });

    it("resolver.tree", async function () {
      const result = resolver.tree(cid3);
      const paths = await collect(result);
      expect(paths).to.eql(["one", "two", "someData"]);
    });

    it("resolver.tree with exist()ent path", async function () {
      const result = resolver.tree(cid3, "one");
      const paths = await collect(result);
      expect(paths).to.eql([]);
    });

    it("resolver.tree with non exist()ent path", async function () {
      const result = resolver.tree(cid3, "bananas");
      const paths = await collect(result);
      expect(paths).to.eql([]);
    });

    it("resolver.tree recursive", async function () {
      const result = resolver.tree(cid3, undefined, { recursive: true });
      const paths = await collect(result);
      expect(paths).to.eql([
        "one",
        "two",
        "someData",
        "one/someData",
        "two/one",
        "two/someData",
        "two/one/someData",
      ]);
    });

    it("resolver.tree with existent path recursive", async function () {
      const result = resolver.tree(cid3, "two", { recursive: true });
      const paths = await collect(result);
      expect(paths).to.eql(["one", "someData", "one/someData"]);
    });

    it("resolver.remove", async function () {
      const cid = await resolver.put(node1, "dag-cbor");
      const sameAsNode1 = await resolver.get(cid);
      expect(sameAsNode1).to.eql(node1);

      const remove = async function () {
        // Verify that the item got really deleted
        try {
          await resolver.remove(cid);
          await resolver.get(cid);
          expect(false).to.eql(true);
        } catch (err) {
          expect(err).to.exist;
        }
      };
      return remove();
    });
  });
});

describe("dag service with dag-pb", function () {
  let node1: typeof DAGNode;
  let node2: typeof DAGNode;
  let node3: typeof DAGNode;
  let cid1: CID;
  let cid2: CID;
  let cid3: CID;

  before(async function () {
    resolver = new DAGService({ blockService: bs });

    node1 = new DAGNode(Buffer.from("I am 1"));
    node2 = new DAGNode(Buffer.from("I am 2"));
    node3 = new DAGNode(Buffer.from("I am 3"));
    const serialized1 = util.serialize(node1);
    cid1 = await util.cid(serialized1);
    node2.addLink({
      name: "1",
      size: node1.Tsize,
      cid: cid1,
    });
    node3.addLink({
      name: "1",
      size: node1.size,
      cid: cid1,
    });
    const serialized2 = util.serialize(node2);
    cid2 = await util.cid(serialized2);
    node3.addLink({
      name: "2",
      size: node2.size,
      cid: cid2,
    });

    const nodes = [node1, node2, node3];
    const result = resolver.putMany(nodes, "dag-pb");
    [cid1, cid2, cid3] = await collect(result);
  });

  describe("public api", function () {
    it("resolver.put with format", async function () {
      const cid = await resolver.put(node1, "dag-pb");
      expect(cid.version).to.eql(1);
      expect(cid.code).to.eql(0x70);
      expect(cid.multihash).to.not.be.undefined;
      const mh = multihash.decode(Buffer.from(cid.multihash));
      expect(mh.name).to.eql("sha2-256");
    });

    it("resolver.put with format + hashAlg", async function () {
      const cid = await resolver.put(node1, "dag-pb", {
        hashAlg: "sha2-512",
      });
      expect(cid.version).to.eql(1);
      expect(cid.code).to.eql(0x70);
      expect(cid.multihash).to.not.be.undefined;
      const mh = multihash.decode(Buffer.from(cid.multihash));
      expect(mh.name).to.eql("sha2-512");
    });

    it("resolves a value within 1st node scope", async function () {
      const result = resolver.resolve(cid1, "Data");
      const { value } = await result.next();
      expect(value.remainderPath).to.eql("");
      expect(value.value).to.eql(Buffer.from("I am 1"));
    });

    it("resolves a value within nested scope (1 level)", async function () {
      const result = resolver.resolve(cid2, "Links/0/Hash/Data");
      const [node1, node2] = await collect(result);

      expect(node1.remainderPath).to.eql("Data");
      expect(node1.value).to.eql(cid1);

      expect(node2.remainderPath).to.eql("");
      expect(node2.value).to.eql(Buffer.from("I am 1"));
    });

    it("resolves value within nested scope (2 levels)", async function () {
      const result = resolver.resolve(cid3, "Links/1/Hash/Links/0/Hash/Data");
      const [node1, node2, node3] = await collect(result);

      expect(node1.remainderPath).to.eql("Links/0/Hash/Data");
      expect(node1.value).to.eql(cid2);

      expect(node2.remainderPath).to.eql("Data");
      expect(node2.value).to.eql(cid1);

      expect(node3.remainderPath).to.eql("");
      expect(node3.value).to.eql(Buffer.from("I am 1"));
    });

    it("resolver.get round-trip", async function () {
      const cid = await resolver.put(node1, "dag-pb");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const node: any = await resolver.get(cid);
      // `size` is lazy, without a call to it a deep equal check would fail
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _ = node.size;
      expect(node).to.eql(node1);
    });

    it("resolver.remove", async function () {
      const node = new DAGNode(Buffer.from("a dag-pb node"));
      const cid = await resolver.put(node, "dag-pb");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sameAsNode: any = await resolver.get(cid);
      // `size` is lazy, without a call to it a deep equal check would fail
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _ = sameAsNode.size;
      expect(sameAsNode.data).to.eql(node.data);

      async function remove() {
        try {
          await resolver.remove(cid);
          await resolver.get(cid);
          expect(false).to.eql(true);
        } catch (err) {
          expect(err).to.exist;
        }
      }
      return remove();
    });

    it("should return a v0 CID when specified", async function () {
      const cid = await resolver.put(Buffer.from("a dag-pb node"), "dag-pb", {
        cidVersion: 0,
      });

      expect(cid.version).to.eql(0);
    });

    it("should return a v1 CID when specified", async function () {
      const cid = await resolver.put(Buffer.from("a dag-pb node"), "dag-pb", {
        cidVersion: 1,
      });

      expect(cid.version).to.eql(1);
    });
  });
});
