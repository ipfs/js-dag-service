import PeerId from "peer-id";
import CID from "cids";
import { Peer } from "../core";

export interface Options {
  timeout: number;
  maxNumProviders: number;
}

export class Dht {
  constructor(private parent: Peer) {}

  /**
   * Query the DHT for all multiaddresses associated with a `PeerId`.
   *
   * @param peer - The id of the peer to search for.
   */
  async findPeer(
    id: PeerId | string,
    options: { timeout?: number } = {}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    if (!this.parent.isOnline()) {
      throw new Error("peer is not online");
    }
    if (typeof id === "string") {
      id = PeerId.createFromB58String(id);
    }
    return this.parent.host.peerRouting.findPeer(id, options);
  }

  /**
   * Find peers in the DHT that can provide a specific value, given a key.
   *
   * @param cid - They cid to find providers for.
   */
  async findProvs(
    cid: CID | string,
    options: { timeout?: number; maxNumProviders?: number } = {}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    if (!this.parent.isOnline()) {
      throw new Error("peer is not online");
    }
    if (typeof cid === "string") {
      cid = new CID(cid);
    }

    return this.parent.host.contentRouting.findProviders(cid, options);
  }

  /**
   * Announce to the network that we are providing given values.
   *
   * @param cids - The CIDs that should be announced.
   * @param options - If recirsive is true, provide not only the given object but also all objects linked from it.
   */
  async provide(
    cids: CID | CID[],
    options: { recursive?: boolean } = {}
  ): Promise<void> {
    if (!this.parent.isOnline()) {
      throw new Error("peer is not online");
    }
    if (!Array.isArray(cids)) {
      cids = [cids];
    }
    // Ensure blocks are actually local
    const all = await Promise.all(cids.map((cid) => this.parent.hasBlock(cid)));
    if (!all.every((has) => has)) {
      throw new Error("block(s) not found locally, cannot provide");
    }
    if (options.recursive) {
      // @todo: Implement recursive providing
      throw new Error("not implemented yet");
    } else {
      await Promise.all(
        cids.map((cid) => this.parent.host.contentRouting.provide(cid as never))
      );
    }
  }
}
