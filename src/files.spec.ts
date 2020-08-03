import { expect } from "chai";
import { createReadStream, promises as fs } from "fs";
import { MemoryDatastore } from "interface-datastore";
import { Peer, BlockStore } from ".";
import { setupLibP2PHost } from "./setup";
import "./files";
import { Result } from "./files";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let lite: Peer;
let root: Result | undefined;

describe("getting and putting files", function () {
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
    await fs.unlink("bar.txt");
  });

  it('read file from disc and put to "network"', async function () {
    await fs.writeFile("bar.txt", "Hello World");
    const source = [
      {
        path: "bar",
        content: createReadStream("bar.txt"),
      },
    ];
    root = await lite.addFile(source);
    // `result` should be the root DAG node
    const str = "bafkreiffsgtnic7uebaeuaixgph3pmmq2ywglpylzwrswv5so7m23hyuny";
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(root!.cid.toString()).to.eql(str);
  });

  it('get block from "network" and recursively export', async function () {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const content = await lite.getFile(root!.cid.toString());
    expect(content.toString()).to.eql("Hello World");
  });
});
