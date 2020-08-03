/* eslint-disable @typescript-eslint/ban-types */
declare module "multihashing-async" {
  function Multihashing(
    buf: Buffer,
    alg: number | string,
    length?: number
  ): Promise<Buffer>;
  namespace Multihashing {
    export const Buffer: Buffer;
    export const multihash: Function;
    export const functions: Record<number, Function>;
    export function digest(
      buf: Buffer,
      alg: number | string,
      length?: number
    ): Promise<Buffer>;
    export function createHash(alg: string | number): Function;
    export function validate(buf: Buffer, hash: Buffer): Promise<boolean>;
  }
  export default Multihashing;
}
