import { expect } from "chai";
import { MemoryDatastore } from "interface-datastore";
import { isBrowser } from "browser-or-node";
import { Buffer } from "buffer";
import { Peer, BlockStore } from "..";
import { createHost } from "../setup";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const writeKey = require("libp2p/src/pnet").generate;

const swarmKey = Buffer.alloc(95);
writeKey(swarmKey);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

let p1: Peer;
let p2: Peer;

// Don't run these tests in the browser, they'd require a relay
(isBrowser ? describe.skip : describe)(
  "sync IPLD DAG between IPFS lite peers",
  async function () {
    before(async function () {
      this.timeout(10000);
      p1 = new Peer(
        new BlockStore(new MemoryDatastore()),
        await createHost(undefined, ["/ip4/0.0.0.0/tcp/0"])
      );
      p2 = new Peer(
        new BlockStore(new MemoryDatastore()),
        await createHost(undefined, ["/ip4/0.0.0.0/tcp/0"])
      );
      await p1.start();
      await p2.start();
      await sleep(500);
      await p1.host.dial(p2.host.peerId, undefined);
      await p2.host.dial(p1.host.peerId, undefined);
    });
    after(async function () {
      await p1.stop();
      await p2.stop();
    });

    it("add, sync, get, delete, test", async function () {
      this.timeout(10000);
      const data = {
        akey: "avalue",
      };
      const cid = await p1.put(data, "dag-cbor");
      await sleep(500);
      const test = await p2.get(cid);
      expect(cid.toString()).to.eql(
        "bafyreigzkampgfuhmld36ljrywwcxogf5zyjbkasehbggbmgpy5tmrygpe"
      );
      expect(test).to.eql(data);
      await p1.remove(cid);
      expect(await p1.hasBlock(cid)).to.be.false;
      await p2.remove(cid);
      expect(await p2.hasBlock(cid)).to.be.false;
    });
  }
);
