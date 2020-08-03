declare module "libp2p-kad-dht" {
  class LibP2pKadDht {
    readonly isStarted: boolean;

    randomWalk: {
      start(queries?: number, period?: number, maxTimeout?: number): void;
      stop(): void;
    };
  }

  export default LibP2pKadDht;
}
