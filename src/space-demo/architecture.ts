
import * as THREE from "three";

import { Kit } from "./kit";

import { BZ, D, H, PX, T, TZ, W, WX } from "./layout";


export type DoorHandle = {

  id: string;

  type: "swing" | "slide";

  group: THREE.Group;

  maxAngle?: number;

  slideMesh?: THREE.Object3D;

  slideFrom?: number;

  slideTravel?: number;

};


export function buildArchitecture(kit: Kit): DoorHandle[] {

  const { mats } = kit;

  const ht = T / 2;


  const floor = (mat: THREE.Material, cx: number, cz: number, w: number, d: number, y = -0.02) => {

    kit.box(mat, cx, y, cz, w, 0.04, d).castShadow = false;

  };

  floor(mats.woodFloor, (PX - ht) / 2, D / 2, PX - ht, D);

  floor(mats.woodFloorBed, (PX + ht + W) / 2, (BZ - ht) / 2, W - PX - ht, BZ - ht);

  floor(mats.tile, (PX + ht + WX - ht) / 2, (BZ + ht + TZ - ht) / 2, WX - PX - T, TZ - BZ - T);

  floor(mats.tile, (WX + ht + W) / 2, (BZ + ht + TZ - ht) / 2, W - WX - ht, TZ - BZ - T);

  floor(mats.tile, (PX + ht + WX - ht) / 2, (TZ + ht + D) / 2, WX - PX - T, D - TZ - ht);

  floor(mats.tileDark, (WX + ht + W) / 2, (TZ + ht + D) / 2 - 0.04, W - WX - ht, D - TZ - T, -0.14);

  floor(mats.balcony, (PX - ht) / 2, D + 0.62, PX - ht, 1.24, -0.02);


  const ceilGeo = new THREE.PlaneGeometry(W + T, D + T);

  kit.geos.push(ceilGeo);

  const ceil = kit.mesh(ceilGeo, mats.ceiling, W / 2, H, D / 2, Math.PI / 2, 0, 0);

  ceil.castShadow = false;

  kit.ceiling = ceil;


  kit.wall(-ht, -ht, W + ht, ht);

  kit.wall(-ht, ht, ht, D + ht);


  kit.wall(W - ht, -ht, W + ht, 0.85);

  kit.wall(W - ht, 2.55, W + ht, D + ht);

  kit.wall(W - ht, 0.85, W + ht, 2.55, 0, 0.9);

  kit.wall(W - ht, 0.85, W + ht, 2.55, 2.15, H);

  kit.solid(W - ht, W + ht, -ht, D + ht);


  kit.wall(-ht, D - ht, 0.38, D + ht);

  kit.wall(4.08, D - ht, PX + ht, D + ht);

  kit.wall(0.38, D - ht, 4.08, D + ht, 2.18, H, false);

  kit.solid(0.38, 4.08, D - 0.03, D + 0.03, "balconyGlass");


  kit.wall(PX + ht, D - ht, WX + ht, D + ht);


  kit.wall(WX + ht, D - ht, 6.55, D + ht);

  kit.wall(7.35, D - ht, W + ht, D + ht);

  kit.wall(6.55, D - ht, 7.35, D + ht, 2.1, H, false);


  kit.wall(PX - ht, -ht, PX + ht, 1.45);

  kit.wall(PX - ht, 2.25, PX + ht, TZ - ht);

  kit.wall(PX - ht, 1.45, PX + ht, 2.25, 2.1, H, false);

  kit.wall(PX - ht, TZ + ht, PX + ht, D + ht, 2.1, H, false);


  kit.wall(PX - ht, BZ - ht, W + ht, BZ + ht);

  kit.wall(WX - ht, BZ + ht, WX + ht, TZ - ht);


  kit.wall(PX + ht, TZ - ht, 4.5, TZ + ht);

  kit.wall(5.3, TZ - ht, WX - ht, TZ + ht);

  kit.wall(4.5, TZ - ht, 5.3, TZ + ht, 2.1, H, false);


  kit.wall(WX + ht, TZ - ht, 6.55, TZ + ht);

  kit.wall(7.35, TZ - ht, W + ht, TZ + ht);

  kit.wall(6.55, TZ - ht, 7.35, TZ + ht, 2.1, H, false);


  kit.box(mats.trim, W - 0.04, 1.52, 1.7, 0.05, 1.28, 1.76);

  const eastGlass = kit.box(mats.glass, W - 0.05, 1.52, 1.7, 0.02, 1.2, 1.64);

  eastGlass.castShadow = false;


  kit.box(mats.trim, 2.23, 1.1, D, 3.78, 2.2, 0.06);

  kit.box(mats.trim, 0.4, 1.1, D, 0.06, 2.2, 0.08);

  kit.box(mats.trim, 4.06, 1.1, D, 0.06, 2.2, 0.08);

  kit.box(mats.trim, 2.23, 2.2, D, 3.72, 0.05, 0.08);


  kit.box(mats.balcony, (PX - ht) / 2, -0.08, D + 1.22, PX - ht, 0.12, 0.08).castShadow = false;

  kit.box(mats.metal, 0.06, 0.5, D + 1.2, 0.04, 1.0, 0.04);

  kit.box(mats.metal, PX - 0.18, 0.5, D + 1.2, 0.04, 1.0, 0.04);

  kit.box(mats.metal, (PX - ht) / 2, 1.0, D + 1.2, PX - 0.28, 0.04, 0.04);

  kit.box(mats.metal, (PX - ht) / 2, 0.55, D + 1.2, PX - 0.28, 0.03, 0.03);

  kit.solid(-0.05, PX, D + 1.14, D + 1.28);

  kit.solid(-0.08, 0.12, D, D + 1.28);

  kit.solid(PX - 0.22, PX + 0.05, D, D + 1.28);


  const frame = (x: number, z: number, alongZ: boolean) => {

    if (alongZ) {

      kit.box(mats.trim, x, 1.05, z, 0.08, 2.1, 0.86);

    } else {

      kit.box(mats.trim, x, 1.05, z, 0.86, 2.1, 0.08);

    }

  };

  frame(PX, 1.85, true);

  frame(4.9, TZ, false);

  frame(6.95, TZ, false);

  frame(6.95, D, false);


  const doors: DoorHandle[] = [];


  const swing = (

    id: string,

    hinge: [number, number, number],

    leafOffset: [number, number, number],

    size: [number, number, number],

    maxAngle: number,

  ): DoorHandle => {

    const group = new THREE.Group();

    group.position.set(...hinge);

    const leaf = new THREE.Mesh(new THREE.BoxGeometry(...size), mats.wood);

    leaf.position.set(...leafOffset);

    leaf.castShadow = true;

    leaf.receiveShadow = true;

    group.add(leaf);

    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.1, 8), mats.metal);

    handle.rotation.z = Math.PI / 2;

    handle.position.set(leafOffset[0] + Math.sign(size[0] || 1) * 0.01, 0.95, leafOffset[2]);

    group.add(handle);

    kit.add(group);

    kit.geos.push(leaf.geometry as THREE.BoxGeometry, handle.geometry as THREE.CylinderGeometry);

    const h: DoorHandle = { id, type: "swing", group, maxAngle };

    doors.push(h);

    return h;

  };


  swing("bedroom", [PX, 0, 2.25], [0, 1.05, -0.4], [0.04, 2.08, 0.78], Math.PI * 0.52);

  kit.solid(PX - 0.04, PX + 0.04, 1.45, 2.25, "door:bedroom");

  swing("bath", [4.5, 0, TZ], [0.4, 1.05, 0], [0.78, 2.08, 0.04], -Math.PI * 0.52);

  kit.solid(4.5, 5.3, TZ - 0.04, TZ + 0.04, "door:bath");

  swing("toilet", [6.55, 0, TZ], [0.4, 1.05, 0], [0.78, 2.08, 0.04], -Math.PI * 0.52);

  kit.solid(6.55, 7.35, TZ - 0.04, TZ + 0.04, "door:toilet");

  swing("entrance", [7.35, 0, D], [-0.4, 1.05, 0], [0.78, 2.08, 0.04], Math.PI * 0.52);

  kit.solid(6.55, 7.35, D - 0.04, D + 0.04, "door:entrance");


  const slider = new THREE.Group();

  slider.position.set(3.15, 0, D);

  const pane = new THREE.Mesh(new THREE.BoxGeometry(1.72, 2.12, 0.03), mats.glass);

  pane.position.set(0, 1.08, 0);

  pane.castShadow = false;

  pane.receiveShadow = false;

  const paneFrame = new THREE.Mesh(new THREE.BoxGeometry(1.76, 2.16, 0.045), mats.trim);

  paneFrame.position.set(0, 1.08, 0.01);

  slider.add(paneFrame, pane);

  kit.add(slider);

  kit.geos.push(pane.geometry as THREE.BoxGeometry, paneFrame.geometry as THREE.BoxGeometry);


  const fixed = new THREE.Mesh(new THREE.BoxGeometry(1.72, 2.12, 0.03), mats.glass);

  fixed.position.set(1.28, 1.08, D + 0.01);

  fixed.castShadow = false;

  kit.add(fixed);

  kit.geos.push(fixed.geometry as THREE.BoxGeometry);


  doors.push({

    id: "balcony",

    type: "slide",

    group: slider,

    slideMesh: slider,

    slideFrom: 3.15,

    slideTravel: 1.55,

  });


  kit.box(mats.curtain, 0.55, 1.25, D - 0.08, 0.28, 2.1, 0.04);

  kit.box(mats.curtain, 3.95, 1.25, D - 0.08, 0.28, 2.1, 0.04);


  const lamp = (x: number, z: number) => {

    kit.cyl(mats.white, x, H - 0.04, z, 0.18, 0.18, 0.04, 20).castShadow = false;

  };

  lamp(2.1, 2.4);

  lamp(2.1, 4.6);

  lamp(6.1, 1.7);

  lamp(5.3, 4.8);


  kit.box(mats.woodDark, (PX - ht) / 2, 0.04, ht + 0.01, PX - T, 0.08, 0.02).castShadow = false;

  kit.box(mats.woodDark, ht + 0.01, 0.04, D / 2, 0.02, 0.08, D - T).castShadow = false;


  return doors;

}
