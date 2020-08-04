import type Multiaddr from "multiaddr";
import type PeerId from "peer-id";
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

  async peers(
    options: { verbose?: boolean; direction?: "inbound" | "outbound" } = {}
  ): Promise<SwarmPeer[]> {
    if (!this.parent.isOnline()) {
      throw new Error("peer is not online");
    }
    const { verbose } = options;
    const peers: SwarmPeer[] = [];

    for (const [peerId, connections] of this.parent.host.connections) {
      for (const connection of connections) {
        const tupple: SwarmPeer = {
          addr: connection.remoteAddr,
          peer: peerId,
        };

        if (verbose || options.direction) {
          tupple.direction = connection.stat.direction;
        }

        if (verbose) {
          tupple.muxer = connection.stat.multiplexer;
          tupple.latency = "n/a";
        }

        peers.push(tupple);
      }
    }

    return peers;
  }

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

  async localAddrs(): Promise<Multiaddr[]> {
    if (!this.parent.isOnline()) {
      throw new Error("peer is not online");
    }
    return this.parent.host.multiaddrs;
  }

  async addrs(): Promise<Array<{ id: PeerId; addrs: Multiaddr[] }>> {
    if (!this.parent.isOnline()) {
      throw new Error("peer is not online");
    }
    const peers = [];
    for (const [peerId, peer] of this.parent.host.peerStore.peers.entries()) {
      peers.push({
        id: peerId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        addrs: peer.addresses.map((mi: any) => mi.multiaddr),
      });
    }
    return peers;
  }
}
