import Protector from "libp2p/src/pnet";
import PeerId from "peer-id";
import type { Options } from "libp2p";
import { Buffer } from "buffer";
import Libp2p from "libp2p";
import merge from "deepmerge";

// This should get replaced by `browser` in the browser
import { defaults } from "./node";

// Export the interfaces for use by callers
export { Options as Libp2pOptions };
// Include MemoryDatastore for user convenience
export { MemoryDatastore } from "interface-datastore";
// Include Buffer for user convenience
export { Buffer } from "buffer";

export const setupLibP2PHost = async (
  peerId?: PeerId,
  secret?: Uint8Array,
  listen: string[] = ["/ip4/0.0.0.0/tcp/4005", "/ip4/127.0.0.1/tcp/4006/ws"],
  opts?: Options
): Promise<Libp2p> => {
  const options: Partial<Options> = merge(
    {
      addresses: { listen },
      ...opts,
    },
    defaults
  );
  if (secret) {
    if (!options.modules) {
      options.modules = {};
    }
    options.modules.connProtector = new Protector(Buffer.from(secret));
  }
  if (peerId) {
    options.peerId = peerId;
  }
  return Libp2p.create(options);
};
