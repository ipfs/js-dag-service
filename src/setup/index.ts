import PeerId from "peer-id";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Libp2p, { Libp2pOptions } from "libp2p";
import merge from "deepmerge";

// This should get replaced by `browser` in the browser
import { defaults } from "./node";
// Export the interfaces for use by callers
export { Libp2pOptions };
// Include MemoryDatastore for user convenience
export { MemoryDatastore } from "interface-datastore";

/**
 * Create a new libp2p host with js-ipfs like defaults.
 * @param peerId Input peer id to use.
 * @param secret Private key to use for a private dht.
 * @param listen The multiaddrs to listen on.
 * @param opts Any additional options to be passed on the the libp2p host.
 */
export async function createHost(
  peerId?: PeerId,
  listen: string[] = ["/ip4/0.0.0.0/tcp/4005", "/ip4/127.0.0.1/tcp/4006/ws"],
  opts: Partial<Libp2pOptions> = {}
): Promise<Libp2p> {
  const options: Libp2pOptions = merge(
    {
      addresses: { listen },
      ...opts,
      peerId,
    },
    defaults
  );
  return Libp2p.create(options);
}
