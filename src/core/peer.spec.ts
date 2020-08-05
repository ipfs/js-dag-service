import { expect } from "chai";
import { isBrowser } from "browser-or-node";
import { MemoryDatastore } from "interface-datastore";
import multiformats, { CID } from "multiformats/basics.js";
import { Peer, BlockStore } from "..";
import { setupLibP2PHost } from "../setup";

// @todo: Once this is more readily available, import as a module?
// Start dag-pb codec
const {
  util: { serialize, deserialize },
  // eslint-disable-next-line @typescript-eslint/no-var-requires
} = require("ipld-dag-pb");
const dagpb = {
  encode: serialize,
  decode: deserialize,
  code: 0x70,
  name: "dag-pb",
};
multiformats.multicodec.add(dagpb);
// End dag-pb codec

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let lite: Peer;
// Don't run these tests in the browser, they'd require a relay
(isBrowser ? describe.skip : describe)(
  "fetching IPLD dag from network",
  function () {
    this.timeout(10000);
    before(async function () {
      const bs = new BlockStore(new MemoryDatastore());
      const host = await setupLibP2PHost(undefined, undefined, [
        "/ip4/0.0.0.0/tcp/0",
      ]);
      lite = new Peer(bs, host);
      await lite.start();
      await sleep(500);
    });
    after(async function () {
      await lite.stop();
    });

    // Skip until next multiformats release
    it.skip("request, fetch, and decode", async function () {
      const cid = new CID("QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
