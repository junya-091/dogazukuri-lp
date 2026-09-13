
/** 1LDK 8.0m × 6.0m. Origin = NW corner, +X east, +Z south, +Y up. */


export const W = 8;

export const D = 6;

export const H = 2.4;

export const T = 0.12;


export const PX = 4.24;

export const BZ = 3.64;

export const WX = 6.24;

export const TZ = 4.9;


export const EYE = 1.55;

export const PLAYER_R = 0.18;


export type Collider = {

  minX: number;

  maxX: number;

  minZ: number;

  maxZ: number;

  tag?: string;

};


export const FURN = {

  sofa: { x: 1.08, z: 4.62 },

  tableLow: { x: 2.22, z: 4.62 },

  tv: { x: 3.5, z: 4.62 },

  plant: { x: 0.5, z: 5.4 },

  dining: { x: 2.06, z: 2.28 },

  fridge: { x: 3.62, z: 0.5 },

  kitchen: { x: 1.55, z: 0.4 },

  bed: { x: 5.58, z: 1.5 },

  chest: { x: 7.42, z: 0.5 },

  desk: { x: 7.4, z: 2.72 },

  umbrella: { x: 7.52, z: 5.5 },

  washer: { x: 5.9, z: 4.42 },

} as const;


export const SPAWN = { x: 7.1, z: 5.48, yaw: Math.PI / 2 };


export const INTERACTS: { id: string; x: number; z: number; r: number; label: string }[] = [

  { id: "bedroom", x: PX, z: 1.85, r: 1.55, label: "洋室のドア" },

  { id: "bath", x: 5.0, z: TZ, r: 1.45, label: "浴室のドア" },

  { id: "toilet", x: 6.95, z: TZ, r: 1.4, label: "トイレのドア" },

  { id: "entrance", x: 6.95, z: D, r: 1.5, label: "玄関ドア" },

  { id: "balcony", x: 2.2, z: D, r: 1.8, label: "掃き出し窓" },

];


export const ROOM_JUMPS: { id: string; label: string; x: number; z: number; yaw: number }[] = [

  { id: "ldk", label: "LDK", x: 2.1, z: 4.4, yaw: 0.05 },

  { id: "dining", label: "ダイニング", x: 2.15, z: 3.2, yaw: Math.PI },

  { id: "bed", label: "洋室", x: 6.15, z: 2.15, yaw: Math.PI },

  { id: "bath", label: "浴室", x: 5.15, z: 4.55, yaw: 0 },

  { id: "genkan", label: "玄関", x: SPAWN.x, z: SPAWN.z, yaw: SPAWN.yaw },

];


export function roomName(x: number, z: number): string {

  if (z > D + 0.05 && x < PX + 0.2) return "バルコニー";

  if (x > WX && z > TZ) return "玄関";

  if (x > PX && z > TZ) return "廊下";

  if (x > WX && z > BZ) return "トイレ";

  if (x > PX && z > BZ) return "浴室";

  if (x > PX) return "洋室";

  if (z < 1.7) return "キッチン";

  if (z < 3.4) return "ダイニング";

  return "リビング";

}


export function floorY(x: number, z: number): number {

  if (x > WX - 0.02 && z > TZ + 0.02 && z < D + 0.05) return -0.12;

  return 0;

}
