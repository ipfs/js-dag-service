import type Multiaddr from "multiaddr";
import type PeerId from "peer-id";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import type { Connection } from "libp2p";
import type { Peer } from "../core";

export interface SwarmPeer {
  addr: Multiaddr;
  peer: PeerId | string;
  latency?: string;
  muxer?: string;
  streams?: string[];
  error?: Error;
  direction?: "inbound" | "outbound";
}

export class Swarm {
  constructor(private parent: Peer) {}

  async connect(addr: Multiaddr): Promise<Connection> {
    if (!this.parent.isOnline()) {
      throw new Error("peer is not online");
    }
    return this.parent.host.dial(addr);
  }

  async disconnect(addr: Multiaddr): Promise<void> {
    if (!this.parent.isOnline()) {
      throw new Error("peer is not online");
    }
    return this.parent.host.hangUp(addr);
  }
}
