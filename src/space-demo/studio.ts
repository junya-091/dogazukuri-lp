
import * as THREE from "three";

import type { Kit } from "./kit";


export const ST = {

  W: 10,

  D: 7,

  H: 3.2,

  T: 0.12,

  SPAWN: { x: 5.05, z: 5.55, yaw: 0 },

  ORBIT: { target: [5, 0.2, 3.2] as [number, number, number], dist: 15, theta: 0.38, phi: 0.68 },

} as const;


export const STUDIO_INTERACTS: { id: string; x: number; z: number; r: number; label: string }[] = [

  { id: "monitor", x: 1.55, z: 2.75, r: 1.45, label: "編集モニター" },

  { id: "camera", x: 8.35, z: 3.15, r: 1.35, label: "カメラ" },

  { id: "terminal", x: 8.55, z: 1.05, r: 1.4, label: "AI 端末" },

];


export const STUDIO_JUMPS: { id: string; label: string; x: number; z: number; yaw: number }[] = [

  { id: "desk", label: "デスク", x: 2.35, z: 2.85, yaw: Math.PI / 2 },

  { id: "shoot", label: "撮影", x: 5.0, z: 3.6, yaw: Math.PI },

  { id: "meet", label: "ミーティング", x: 2.15, z: 5.35, yaw: Math.PI },

  { id: "lab", label: "AI Lab", x: 7.6, z: 1.55, yaw: -0.4 },

];


export function studioRoomName(x: number, z: number): string {

  if (x < 3.4 && z > 4.6) return "ミーティング";

  if (x < 3.6 && z < 4.4) return "編集デスク";

  if (x > 7.2 && z < 2.2) return "AI Lab";

  if (x > 7.0) return "カメラゾーン";

  if (z < 2.4) return "サイクロラマ";

  return "撮影スペース";

}


export type StudioHandle = {

  tick: (ms: number) => void;

  togglePlay: () => boolean;

  playing: () => boolean;

  dispose: () => void;

};


function std(color: string, extras: THREE.MeshStandardMaterialParameters = {}) {

  return new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0, ...extras });

}


export function buildStudio(kit: Kit): StudioHandle {

  const W = ST.W;

  const D = ST.D;

  const H = ST.H;

  const ht = ST.T / 2;


  const wall = std("#e8e8ea", { roughness: 0.9 });

  const wallBlack = std("#121316", { roughness: 0.86 });

  const floor = std("#1a1b20", { roughness: 0.38, metalness: 0.18 });

  const ceiling = std("#14151a", { roughness: 0.95 });

  const cyan = std("#6ae7ef", { emissive: "#2ec8d4", emissiveIntensity: 1.15, roughness: 0.28 });

  const whiteE = std("#f4f7fb", { emissive: "#dfe7f2", emissiveIntensity: 0.85, roughness: 0.35 });

  const black = std("#16171b", { roughness: 0.32, metalness: 0.25 });

  const metal = std("#c5c8cc", { roughness: 0.28, metalness: 0.72 });

  const metalDark = std("#3a3d44", { roughness: 0.4, metalness: 0.55 });

  const deskMat = std("#2a2c32", { roughness: 0.45 });

  const fabric = std("#cfd3d8", { roughness: 0.82 });

  const fabricDark = std("#2c2e34", { roughness: 0.84 });

  const soft = std("#f2f4f7", { roughness: 0.88 });

  kit.extraMats.push(wall, wallBlack, floor, ceiling, cyan, whiteE, black, metal, metalDark, deskMat, fabric, fabricDark, soft);


  kit.box(floor, W / 2, -0.02, D / 2, W, 0.04, D).castShadow = false;

  for (let i = 1; i < 10; i++) {

    kit.box(metalDark, i, 0.001, D / 2, 0.012, 0.002, D - 0.3).castShadow = false;

  }

  for (let i = 1; i < 7; i++) {

    kit.box(metalDark, W / 2, 0.001, i, W - 0.3, 0.002, 0.012).castShadow = false;

  }


  const ceilGeo = new THREE.PlaneGeometry(W + ST.T, D + ST.T);

  kit.geos.push(ceilGeo);

  const ceil = kit.mesh(ceilGeo, ceiling, W / 2, H, D / 2, Math.PI / 2, 0, 0);

  ceil.castShadow = false;

  kit.ceiling = ceil;


  kit.box(wallBlack, W / 2, H / 2, -ht, W + ST.T, H, ST.T);

  kit.solid(-ht, W + ht, -ht, ht);

  kit.solid(0.1, W - 0.1, 0.08, 0.72);

  kit.box(wall, -ht, H / 2, D / 2, ST.T, H, D + ST.T);

  kit.solid(-ht, ht, -ht, D + ht);

  kit.box(wall, W + ht, H / 2, D / 2, ST.T, H, D + ST.T);

  kit.solid(W - ht, W + ht, -ht, D + ht);

  kit.box(wall, 2.225, H / 2, D + ht, 4.45, H, ST.T);

  kit.box(wall, 7.775, H / 2, D + ht, 4.45, H, ST.T);

  kit.box(wall, 5.0, 2.85, D + ht, 1.1, 0.7, ST.T);

  kit.solid(-ht, 4.45, D - ht, D + ht);

  kit.solid(5.55, W + ht, D - ht, D + ht);


  const cove = new THREE.CylinderGeometry(0.85, 0.85, W - 0.2, 20, 1, false, 0, Math.PI / 2);

  cove.rotateZ(Math.PI / 2);

  kit.geos.push(cove);

  const coveMesh = kit.mesh(cove, wallBlack, W / 2, 0.85, 0.85, 0, 0, 0);

  coveMesh.castShadow = false;


  for (const z of [1.6, 3.4, 5.2]) {

    kit.box(metalDark, W / 2, H - 0.08, z, 8.4, 0.04, 0.08).castShadow = false;

    kit.box(z === 3.4 ? cyan : whiteE, W / 2, H - 0.12, z, 8.0, 0.02, 0.04).castShadow = false;

  }


  const dx = 1.28;

  const dz = 2.72;

  kit.box(deskMat, dx, 0.74, dz, 0.82, 0.06, 2.35);

  kit.box(metalDark, dx - 0.34, 0.36, dz - 0.95, 0.06, 0.72, 0.06);

  kit.box(metalDark, dx + 0.34, 0.36, dz - 0.95, 0.06, 0.72, 0.06);

  kit.box(metalDark, dx - 0.34, 0.36, dz + 0.95, 0.06, 0.72, 0.06);

  kit.box(metalDark, dx + 0.34, 0.36, dz + 0.95, 0.06, 0.72, 0.06);

  kit.solid(dx - 0.46, dx + 0.46, dz - 1.22, dz + 1.22);


  kit.box(black, dx + 0.28, 1.28, dz - 0.42, 0.06, 0.7, 1.12);

  kit.box(black, dx + 0.26, 1.22, dz + 0.62, 0.05, 0.52, 0.82);

  kit.box(metalDark, dx + 0.16, 0.9, dz - 0.42, 0.18, 0.1, 0.2);

  kit.box(metalDark, dx + 0.16, 0.88, dz + 0.62, 0.16, 0.08, 0.16);


  const canvas = document.createElement("canvas");

  canvas.width = 512;

  canvas.height = 288;

  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("studio screen");

  const g: CanvasRenderingContext2D = ctx;

  const tex = new THREE.CanvasTexture(canvas);

  tex.colorSpace = THREE.SRGBColorSpace;

  tex.anisotropy = 8;

  const screenMat = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });

  kit.extraMats.push(screenMat);

  const screenGeo = new THREE.PlaneGeometry(1.04, 0.62);

  kit.geos.push(screenGeo);

  const screen = new THREE.Mesh(screenGeo, screenMat);

  screen.position.set(dx + 0.315, 1.28, dz - 0.42);

  screen.rotation.y = Math.PI / 2;

  screen.castShadow = false;

  kit.add(screen);


  const sideGeo = new THREE.PlaneGeometry(0.76, 0.46);

  kit.geos.push(sideGeo);

  const sideMat = new THREE.MeshBasicMaterial({ color: "#0c1116", toneMapped: false });

  kit.extraMats.push(sideMat);

  const side = new THREE.Mesh(sideGeo, sideMat);

  side.position.set(dx + 0.29, 1.22, dz + 0.62);

  side.rotation.y = Math.PI / 2;

  kit.add(side);


  kit.box(deskMat, 0.28, 1.85, dz, 0.28, 0.04, 2.4);

  kit.box(black, 0.18, 1.55, dz - 0.42, 0.04, 0.5, 0.9);

  kit.box(black, dx + 0.12, 0.78, dz + 0.15, 0.32, 0.02, 0.72);

  kit.box(metal, dx + 0.05, 0.785, dz - 0.85, 0.22, 0.01, 0.3);


  kit.cyl(metalDark, dx + 0.72, 0.22, dz, 0.18, 0.2, 0.08, 12);

  kit.cyl(metal, dx + 0.72, 0.42, dz, 0.03, 0.03, 0.4, 8);

  kit.box(fabricDark, dx + 0.72, 0.62, dz, 0.42, 0.06, 0.42);

  kit.box(fabricDark, dx + 0.55, 0.95, dz, 0.06, 0.42, 0.42);

  kit.solid(dx + 0.5, dx + 0.95, dz - 0.24, dz + 0.24);


  const mx = 2.05;

  const mz = 5.85;

  kit.box(fabric, mx, 0.22, mz, 1.85, 0.2, 0.72);

  kit.box(fabric, mx, 0.52, mz + 0.28, 1.85, 0.42, 0.16);

  kit.box(soft, mx - 0.55, 0.4, mz - 0.05, 0.38, 0.12, 0.32);

  kit.box(soft, mx + 0.55, 0.4, mz - 0.05, 0.38, 0.12, 0.32);

  kit.solid(mx - 0.96, mx + 0.96, mz - 0.4, mz + 0.42);

  kit.cyl(metalDark, mx, 0.22, mz - 0.85, 0.22, 0.22, 0.04, 20);

  kit.cyl(metalDark, mx, 0.38, mz - 0.85, 0.04, 0.04, 0.32, 8);

  kit.cyl(black, mx, 0.55, mz - 0.85, 0.38, 0.38, 0.03, 20);

  kit.solid(mx - 0.4, mx + 0.4, mz - 1.22, mz - 0.48);


  const cx = 8.42;

  const cz = 3.18;

  kit.cyl(metalDark, cx, 0.06, cz, 0.22, 0.22, 0.04, 16);

  kit.cyl(metal, cx, 0.55, cz, 0.03, 0.03, 0.95, 8);

  kit.box(black, cx - 0.12, 1.18, cz, 0.22, 0.16, 0.28);

  kit.cyl(metalDark, cx - 0.26, 1.18, cz, 0.07, 0.08, 0.14, 12);

  kit.cyl(cyan, cx - 0.34, 1.18, cz, 0.03, 0.03, 0.04, 10).castShadow = false;

  kit.solid(cx - 0.28, cx + 0.22, cz - 0.22, cz + 0.22);


  for (const [sx, sz] of [

    [6.6, 1.35],

    [3.55, 1.35],

  ] as const) {

    kit.cyl(metal, sx, 1.35, sz, 0.03, 0.03, 2.4, 8);

    kit.box(soft, sx, 2.15, sz + 0.12, 0.55, 0.7, 0.08);

    kit.box(whiteE, sx, 2.15, sz + 0.16, 0.48, 0.6, 0.02).castShadow = false;

    kit.solid(sx - 0.12, sx + 0.12, sz - 0.12, sz + 0.18);

  }


  const tx = 8.62;

  const tz = 1.05;

  kit.box(black, tx, 0.85, tz, 0.42, 1.7, 0.72);

  kit.box(cyan, tx - 0.22, 1.15, tz, 0.02, 0.72, 0.52).castShadow = false;

  kit.box(metalDark, tx, 0.08, tz, 0.5, 0.08, 0.8);

  kit.solid(tx - 0.28, tx + 0.28, tz - 0.42, tz + 0.42);


  kit.cyl(soft, 5.0, 2.55, 0.22, 0.08, 0.08, 3.4, 12);

  kit.box(soft, 5.0, 1.35, 0.18, 3.35, 2.3, 0.02).castShadow = false;


  let playing = false;

  let lastDraw = -1;


  function draw(ms: number) {

    const w = canvas.width;

    const h = canvas.height;

    g.fillStyle = "#07090c";

    g.fillRect(0, 0, w, h);

    g.fillStyle = playing ? "#6ae7ef" : "#3a4148";

    g.fillRect(0, 0, w, 22);

    g.fillStyle = "#07090c";

    g.font = "12px ui-monospace, monospace";

    g.fillText(playing ? "PLAY   SEQ.01  00:12:08" : "PAUSE  SEQ.01  00:12:08", 12, 16);

    g.fillStyle = "#10141a";

    g.fillRect(12, 34, 300, 168);

    g.strokeStyle = "#2a333c";

    g.strokeRect(12.5, 34.5, 299, 167);

    const t = playing ? ms * 0.001 : 0;

    g.fillStyle = "#6ae7ef";

    g.globalAlpha = 0.85;

    g.fillRect(24, 48, 8, 140);

    g.fillRect(40, 88, 8, 100);

    g.fillRect(56, 64, 8, 124);

    const head = 80 + ((t * 42) % 210);

    g.fillStyle = "#ffffff";

    g.globalAlpha = 1;

    g.fillRect(head, 40, 2, 154);

    g.fillStyle = "#151a21";

    g.fillRect(324, 34, 176, 80);

    g.fillStyle = "#6ae7ef";

    g.font = "11px ui-monospace, monospace";

    g.fillText("V1  A-CAM", 336, 58);

    g.fillStyle = "#8b949e";

    g.fillText("studio / loft", 336, 78);

    g.fillText(playing ? "rendering…" : "ready", 336, 96);

    g.fillStyle = "#151a21";

    g.fillRect(12, 214, 488, 60);

    for (let i = 0; i < 12; i++) {

      g.fillStyle = i % 3 === 0 ? "#2ec8d4" : "#243038";

      const bh = 10 + ((i * 13 + (playing ? Math.sin(t + i) * 8 : 4)) % 36);

      g.fillRect(20 + i * 40, 264 - bh, 28, bh);

    }

    tex.needsUpdate = true;

  }

  draw(0);


  return {

    tick(ms) {

      if (!playing) return;

      if (ms - lastDraw < 80) return;

      lastDraw = ms;

      draw(ms);

    },

    togglePlay() {

      playing = !playing;

      draw(playing ? performance.now() : 0);

      return playing;

    },

    playing: () => playing,

    dispose() {

      tex.dispose();

    },

  };

}
