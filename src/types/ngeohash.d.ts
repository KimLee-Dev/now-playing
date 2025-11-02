declare module 'ngeohash' {
  export function encode(latitude: number, longitude: number, precision?: number): string;
  export function decode(geohash: string): { latitude: number; longitude: number };
  export function decode_bbox(geohash: string): number[];
  export function bboxes(minlat: number, minlon: number, maxlat: number, maxlon: number, precision?: number): string[];
  export function neighbor(geohash: string, direction: [number, number]): string;
  export function neighbors(geohash: string): string[];
}
