
import * as THREE from "three";

import type { Kit } from "./kit";


function box(

  kit: Kit,

  mat: THREE.Material,

  x: number,

  y: number,

  z: number,

  w: number,

  h: number,

  d: number,

  rx = 0,

  ry = 0,

  rz = 0,

) {

  const g = new THREE.BoxGeometry(w, h, d);

  kit.geos.push(g);

  const m = new THREE.Mesh(g, mat);

  m.position.set(x, y, z);

  m.rotation.set(rx, ry, rz);

  m.castShadow = true;

  m.receiveShadow = true;

  return m;

}


function cyl(

  kit: Kit,

  mat: THREE.Material,

  x: number,

  y: number,

  z: number,

  rTop: number,

  rBot: number,

  h: number,

  seg = 8,

) {

  const g = new THREE.CylinderGeometry(rTop, rBot, h, seg);

  kit.geos.push(g);

  const m = new THREE.Mesh(g, mat);

  m.position.set(x, y, z);

  m.castShadow = true;

  m.receiveShadow = true;

  return m;

}


function chair(kit: Kit, x: number, y: number, z: number, ry: number) {

  const g = new THREE.Group();

  g.position.set(x, y, z);

  g.rotation.y = ry;

  const { mats } = kit;

  g.add(box(kit, mats.wood, 0, 0.45, 0, 0.42, 0.04, 0.4));

  g.add(box(kit, mats.wood, 0, 0.68, -0.18, 0.42, 0.42, 0.04));

  for (const [lx, lz] of [

    [-0.16, -0.15],

    [0.16, -0.15],

    [-0.16, 0.15],

    [0.16, 0.15],

  ] as const) {

    g.add(cyl(kit, mats.woodDark, lx, 0.225, lz, 0.018, 0.018, 0.45, 8));

  }

  return g;

}


function buildDining(kit: Kit) {

  const g = new THREE.Group();

  const { mats } = kit;

  g.add(box(kit, mats.wood, 0, 0.74, 0, 1.22, 0.04, 0.76));

  for (const [lx, lz] of [

    [-0.5, -0.3],

    [0.5, -0.3],

    [-0.5, 0.3],

    [0.5, 0.3],

  ] as const) {

    g.add(cyl(kit, mats.woodDark, lx, 0.36, lz, 0.025, 0.025, 0.72, 8));

  }

  g.add(chair(kit, 0, 0, -0.58, 0));

  g.add(chair(kit, 0, 0, 0.58, Math.PI));

  return g;

}


function buildSofa(kit: Kit) {

  const g = new THREE.Group();

  const { mats } = kit;

  g.add(box(kit, mats.fabric, 0, 0.2, 0, 0.9, 0.38, 1.72));

  g.add(box(kit, mats.fabric, 0.04, 0.42, 0, 0.78, 0.12, 1.56));

  g.add(box(kit, mats.fabricDark, -0.36, 0.5, 0, 0.16, 0.5, 1.72));

  g.add(box(kit, mats.fabricDark, 0, 0.38, -0.82, 0.9, 0.38, 0.12));

  g.add(box(kit, mats.fabricDark, 0, 0.38, 0.82, 0.9, 0.38, 0.12));

  g.add(box(kit, mats.linen, 0.02, 0.5, -0.38, 0.5, 0.08, 0.62));

  g.add(box(kit, mats.linen, 0.02, 0.5, 0.38, 0.5, 0.08, 0.62));

  return g;

}


function buildDesk(kit: Kit) {

  const g = new THREE.Group();

  const { mats } = kit;

  g.add(box(kit, mats.wood, 0, 0.74, 0, 0.55, 0.04, 1.1));

  g.add(box(kit, mats.woodDark, 0, 0.36, -0.48, 0.5, 0.72, 0.05));

  g.add(box(kit, mats.woodDark, 0, 0.36, 0.48, 0.5, 0.72, 0.05));

  g.add(chair(kit, -0.48, 0, 0, Math.PI / 2));

  g.add(box(kit, mats.metalDark, -0.04, 0.78, 0, 0.3, 0.012, 0.2));

  const lid = box(kit, mats.laptop, -0.04, 0.89, -0.09, 0.3, 0.2, 0.012, -Math.PI / 1.15, 0, 0);

  g.add(lid);

  return g;

}


const BUILDERS: Record<string, (kit: Kit) => THREE.Group> = {

  dining: buildDining,

  sofa: buildSofa,

  desk: buildDesk,

};


export function buildProp(kit: Kit, name: string): THREE.Group | null {

  const fn = BUILDERS[name];

  if (!fn) return null;

  const g = fn(kit);

  g.name = name;

  return g;

}
