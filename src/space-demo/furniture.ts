
import * as THREE from "three";

import { Kit } from "./kit";

import { FURN } from "./layout";


export function buildFurniture(kit: Kit) {

  const { mats } = kit;


  const kx = FURN.kitchen.x;

  const kz = FURN.kitchen.z;

  kit.box(mats.wood, kx, 0.42, kz, 2.9, 0.84, 0.58);

  kit.box(mats.white, kx, 0.86, kz, 2.92, 0.04, 0.6);

  kit.box(mats.wood, kx, 2.05, kz - 0.08, 2.7, 0.55, 0.34);

  kit.box(mats.ih, kx - 0.35, 0.9, kz, 0.56, 0.02, 0.46);

  for (const ox of [-0.16, 0, 0.16]) {

    kit.cyl(mats.metalDark, kx - 0.35 + ox, 0.915, kz, 0.07, 0.07, 0.01, 20).castShadow = false;

  }

  kit.box(mats.metal, kx + 0.7, 0.82, kz, 0.42, 0.08, 0.36);

  kit.box(mats.metalDark, kx + 0.7, 0.74, kz, 0.32, 0.1, 0.26);

  kit.box(mats.metal, kx - 0.35, 1.55, kz - 0.04, 0.62, 0.08, 0.4);

  kit.box(mats.metalDark, kx - 0.35, 1.72, kz - 0.08, 0.5, 0.28, 0.22);

  kit.solid(0.12, 3.05, 0.1, 0.74);


  const fx = FURN.fridge.x;

  const fz = FURN.fridge.z;

  kit.box(mats.white, fx, 0.88, fz, 0.6, 1.76, 0.62);

  kit.box(mats.metal, fx - 0.31, 0.88, fz, 0.02, 1.7, 0.58);

  kit.box(mats.metal, fx - 0.33, 1.15, fz + 0.2, 0.02, 0.12, 0.04);

  kit.solid(fx - 0.34, fx + 0.34, fz - 0.34, fz + 0.34);


  const lx = FURN.tableLow.x;

  const lz = FURN.tableLow.z;

  kit.box(mats.woodDark, lx, 0.28, lz, 0.58, 0.04, 0.92);

  for (const [ox, oz] of [

    [-0.22, -0.38],

    [0.22, -0.38],

    [-0.22, 0.38],

    [0.22, 0.38],

  ] as const) {

    kit.cyl(mats.woodDark, lx + ox, 0.14, lz + oz, 0.02, 0.02, 0.26, 8);

  }

  kit.solid(lx - 0.3, lx + 0.3, lz - 0.48, lz + 0.48);


  const tx = FURN.tv.x;

  const tz = FURN.tv.z;

  kit.box(mats.woodDark, tx, 0.24, tz, 0.4, 0.48, 1.18);

  kit.box(mats.black, tx - 0.16, 0.92, tz, 0.05, 0.64, 1.08);

  const screen = kit.box(mats.screen, tx - 0.19, 0.92, tz, 0.01, 0.56, 0.98);

  screen.castShadow = false;

  kit.solid(tx - 0.28, tx + 0.26, tz - 0.62, tz + 0.62);


  kit.box(mats.fabricDark, 2.2, 0.01, 4.62, 2.6, 0.015, 2.05).castShadow = false;


  const px = FURN.plant.x;

  const pz = FURN.plant.z;

  kit.cyl(mats.pot, px, 0.12, pz, 0.13, 0.1, 0.24, 14);

  kit.cyl(mats.soil, px, 0.23, pz, 0.1, 0.1, 0.04, 10).castShadow = false;

  kit.sphere(mats.plant, px, 0.55, pz, 0.22, 12);

  kit.sphere(mats.plantDark, px + 0.12, 0.48, pz + 0.06, 0.16, 10);

  kit.sphere(mats.plant, px - 0.1, 0.62, pz - 0.08, 0.14, 10);

  kit.solid(px - 0.16, px + 0.16, pz - 0.16, pz + 0.16);


  const bx = FURN.bed.x;

  const bz = FURN.bed.z;

  kit.box(mats.woodDark, bx, 0.16, bz, 2.08, 0.2, 1.48);

  kit.box(mats.woodDark, bx - 1.0, 0.52, bz, 0.08, 0.92, 1.48);

  kit.box(mats.linen, bx + 0.06, 0.34, bz, 1.9, 0.16, 1.38);

  kit.box(mats.linen, bx + 0.18, 0.46, bz, 1.5, 0.08, 1.28);

  kit.box(mats.pillow, bx - 0.72, 0.46, bz - 0.28, 0.38, 0.12, 0.48);

  kit.box(mats.pillow, bx - 0.72, 0.46, bz + 0.28, 0.38, 0.12, 0.48);

  kit.solid(bx - 1.08, bx + 1.06, bz - 0.76, bz + 0.76);


  const cx = FURN.chest.x;

  const cz = FURN.chest.z;

  kit.box(mats.wood, cx, 0.48, cz, 0.48, 0.96, 0.9);

  for (const oy of [0.18, 0.48, 0.78]) {

    kit.box(mats.woodDark, cx - 0.245, oy, cz, 0.02, 0.22, 0.82);

    kit.box(mats.metal, cx - 0.26, oy, cz, 0.02, 0.02, 0.12);

  }

  kit.solid(cx - 0.28, cx + 0.28, cz - 0.48, cz + 0.48);


  kit.box(mats.porcelain, 5.15, 0.28, 4.15, 1.42, 0.52, 0.68);

  kit.box(mats.water, 5.15, 0.42, 4.15, 1.22, 0.08, 0.5).castShadow = false;

  kit.cyl(mats.metal, 4.55, 1.55, 3.9, 0.012, 0.012, 1.4, 8);

  kit.sphere(mats.metal, 4.55, 2.2, 4.02, 0.05, 10);

  kit.box(mats.white, 4.72, 0.82, 4.45, 0.5, 0.12, 0.36);

  kit.cyl(mats.porcelain, 4.72, 0.9, 4.45, 0.16, 0.14, 0.08, 16);

  kit.box(mats.metal, 4.72, 1.45, 4.62, 0.4, 0.5, 0.02);

  kit.solid(4.44, 5.86, 3.8, 4.5);


  const wx = FURN.washer.x;

  const wz = FURN.washer.z;

  kit.box(mats.white, wx, 0.42, wz, 0.56, 0.84, 0.56);

  kit.cyl(mats.metal, wx - 0.28, 0.48, wz, 0.16, 0.16, 0.04, 20);

  kit.cyl(mats.glass, wx - 0.3, 0.48, wz, 0.13, 0.13, 0.02, 16).castShadow = false;

  kit.solid(wx - 0.3, wx + 0.3, wz - 0.3, wz + 0.3);


  kit.box(mats.porcelain, 7.15, 0.38, 4.22, 0.38, 0.32, 0.52);

  kit.cyl(mats.porcelain, 7.15, 0.28, 4.38, 0.2, 0.18, 0.36, 16);

  kit.box(mats.porcelain, 7.15, 0.72, 4.05, 0.38, 0.42, 0.16);

  kit.box(mats.white, 7.62, 0.7, 4.35, 0.08, 0.28, 0.08);

  kit.solid(6.9, 7.4, 3.9, 4.58);


  const ux = FURN.umbrella.x;

  const uz = FURN.umbrella.z;

  kit.cyl(mats.metalDark, ux, 0.22, uz, 0.12, 0.14, 0.08, 16);

  kit.cyl(mats.metal, ux, 0.18, uz, 0.1, 0.1, 0.16, 16);

  kit.cyl(mats.black, ux - 0.03, 0.48, uz, 0.012, 0.012, 0.7, 6);

  kit.cyl(mats.black, ux + 0.04, 0.44, uz + 0.03, 0.012, 0.012, 0.62, 6);

  kit.sphere(mats.black, ux - 0.03, 0.84, uz, 0.035, 8);

  kit.sphere(mats.plantDark, ux + 0.04, 0.78, uz + 0.03, 0.05, 8);

  kit.box(mats.wood, 7.62, 0.55, 5.15, 0.28, 1.1, 0.7);

  kit.solid(7.42, 7.86, 4.78, 5.52);

  kit.solid(ux - 0.16, ux + 0.16, uz - 0.16, uz + 0.16);


  kit.box(mats.pot, 0.55, 0.18, 6.55, 0.4, 0.36, 0.32);

  kit.sphere(mats.plant, 0.55, 0.5, 6.55, 0.2, 10);

}
