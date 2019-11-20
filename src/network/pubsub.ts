import { Peer } from '../core'

/**
 * PubSubAPI provides access to the libp2p host's pubsub module.
 */
export class PubSubAPI {
  /**
   * @name pubsub
   * @type PubSubAPI
   * @memberof Peer#
   * @param parent {Peer}
   * @description Access to the libp2p host's pubsub module.
   */
  constructor(private parent: Peer) {}

  private checkOnlineAndEnabled() {
    if (!this.parent.isOnline()) {
      throw new Error('peer is not online')
    }
    if (!this.parent.host.pubsub) {
      throw new Error('pubsub is not enabled')
    }
  }

  async publish(topics: string | string[], messages: any | any[]) {
    this.checkOnlineAndEnabled()
    if (this.parent.host.pubsub) {
      return this.parent.host.pubsub.publish(topics, messages)
    }
  }

  /**
   * Subscribe the given handler to a pubsub topic
   *
   * @param topic - The topic to listen on.
   * @param handler - The handler to subscribe.
   *
   * @example <caption>Subscribe a handler to a topic</caption>
   *
   * const handler = (message) => { }
   * await peer.pubsub.subscribe(topic, handler)
   */
  async subscribe(topics: string | string[], handler: Function) {
    this.checkOnlineAndEnabled()
    if (this.parent.host.pubsub) {
      return this.parent.host.pubsub.subscribe(topics, handler, null)
    }
  }

  /**
   * Unsubscribes from a pubsub topic
   *
   * @param topic - The topic to listen on.
   * @param handler - The handler to unsubscribe from.
   *
   * @example <caption>Unsubscribe a topic for all handlers</caption>
   *
   * await peer.pubsub.unsubscribe(topic, undefined)
   *
   * @example <caption>Unsubscribe a topic for 1 handler</caption>
   *
   * await peer.pubsub.unsubscribe(topic, handler)
   */
  async unsubscribe(topic: string, handler?: Function) {
    this.checkOnlineAndEnabled()
    if (this.parent.host.pubsub) {
      return this.parent.host.pubsub.unsubscribe(topic, handler)
    }
  }
  async ls() {
    this.checkOnlineAndEnabled()
    if (this.parent.host.pubsub) {
      return this.parent.host.pubsub.ls()
    }
  }
  async peers(topic: string) {
    this.checkOnlineAndEnabled()
    if (this.parent.host.pubsub) {
      return this.parent.host.pubsub.peers(topic)
    }
  }
  setMaxListeners(n: number) {
    this.checkOnlineAndEnabled()
    if (this.parent.host.pubsub) {
      return this.parent.host.pubsub.setMaxListeners(n)
    }
  }
}
