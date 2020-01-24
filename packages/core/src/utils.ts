// Basic constructor interface
interface Constructore<T> {
  new (parent: any): T
}

/**
 * Magic function to lazily define child classes as namesapces on parent clases in a type-safe way.
 *
 * @param obj The object to which to add the subclass.
 * @param name The name of the property that subclass will be available under.
 * @param ctor The actual subclass to add.
 * @protected
 * @ignore
 */
export function addSubclass<T>(obj: any, name: string, ctor: Constructore<T>) {
  Object.defineProperty(obj.prototype, name, {
    // Properties should show up during enumeration of properties on Peer
    enumerable: true,
    get: function() {
      // One-time lazily 'get' a new Bitswap and then cache it for subsequent calls
      const value = new ctor(this)
      // Now set the 'cached' value 'permanently'
      Object.defineProperty(this, name, {
        value: value,
        configurable: false,
        writable: false,
        enumerable: true,
      })
      return value
    },
  })
}
