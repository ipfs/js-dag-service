/* eslint-disable @typescript-eslint/ban-types */
declare module "multihashing-async" {
  function Multihashing(
    buf: Uint8Array,
    alg: number | string,
    length?: number
  ): Promise<Uint8Array>;
  namespace Multihashing {
    export const Uint8Array: Uint8Array;
    export const multihash: Function;
    export const functions: Record<number, Function>;
    export function digest(
      buf: Uint8Array,
      alg: number | string,
      length?: number
    ): Promise<Uint8Array>;
    export function createHash(alg: string | number): Function;
    export function validate(
      buf: Uint8Array,
      hash: Uint8Array
    ): Promise<boolean>;
  }
  export default Multihashing;
}
