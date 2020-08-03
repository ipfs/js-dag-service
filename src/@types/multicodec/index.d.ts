declare module "multicodec" {
  export function addPrefix(
    multicodecStrOrCode: string | number,
    data: Buffer
  ): Buffer;
  export function rmPrefix(data: Buffer): Buffer;
  export function getCodec(prefixedData: Buffer): string;
  export function getName(codec: number): string;
  export function getNumber(name: string): number;
  export function getCode(prefixedData: Buffer): number;
  export function getCodeVarint(codecName: string): Buffer;
  export function getVarint(code: number): Array<number>;
}
