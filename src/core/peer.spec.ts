import { expect } from "chai";
import Multiaddr from "multiaddr";
import { isBrowser } from "browser-or-node";
import { MemoryDatastore } from "interface-datastore";
import CID from "cids";
import { Peer, BlockStore } from "..";
import { createHost } from "../setup";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let lite: Peer;
// Don't run these tests in the browser, they'd require a relay
(isBrowser ? describe.skip : describe)(
  "fetching IPLD dag from network",
  function () {
    this.timeout(10000);
    before(async function () {
      const bs = new BlockStore(new MemoryDatastore());
      const host = await createHost(undefined, ["/ip4/0.0.0.0/tcp/0"]);
      lite = new Peer(bs, host);
      await lite.start();
      await sleep(500);
    });
    after(async function () {
      await lite.stop();
    });

    it("request, fetch, and decode", async function () {
      const cid = new CID("QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u");
      const block: any = await lite.get(cid);
      if (block && block.Data) {
        const msg = block.Data.toString()
          .replace(/[^0-9a-zA-Z_\s]/gi, "")
          .trim();
        expect(msg).to.eql("Hello World");
      } else {
        throw Error("Expected block to have data");
      }
    });
  }
);
