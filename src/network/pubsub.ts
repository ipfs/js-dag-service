import { Peer } from "../core";

export class PubSub {
  constructor(private parent: Peer) {}

  private checkOnlineAndEnabled() {
    if (!this.parent.isOnline()) {
      throw new Error("peer is not online");
    }
    if (!this.parent.host.pubsub) {
      throw new Error("pubsub is not enabled");
    }
  }

  async publish(topic: string, message: Uint8Array): Promise<void> {
    this.checkOnlineAndEnabled();
    if (this.parent.host.pubsub) {
      return this.parent.host.pubsub.publish(topic, message);
    }
  }

  /**
   * Subscribe the given handler to a pubsub topic
   */
  async subscribe(topic: string): Promise<void> {
    this.checkOnlineAndEnabled();
    if (this.parent.host.pubsub) {
      return this.parent.host.pubsub.subscribe(topic);
    }
  }

  /**
   * Unsubscribes from a pubsub topic
   */
  async unsubscribe(topic: string): Promise<void> {
    this.checkOnlineAndEnabled();
    if (this.parent.host.pubsub) {
      return this.parent.host.pubsub.unsubscribe(topic);
    }
  }
}
