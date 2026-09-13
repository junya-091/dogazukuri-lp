
import * as THREE from "three";

import type { Collider } from "./layout";

import type { Mats } from "./materials";


export class Kit {

  scene: THREE.Scene;

  root: THREE.Object3D;

  mats: Mats;

  colliders: Collider[] = [];

  geos: THREE.BufferGeometry[] = [];

  extraMats: THREE.Material[] = [];

  objects: THREE.Object3D[] = [];

  ceiling: THREE.Mesh | null = null;


  constructor(scene: THREE.Scene, mats: Mats, root?: THREE.Object3D) {

    this.scene = scene;

    this.mats = mats;

    this.root = root ?? scene;

  }


  add(obj: THREE.Object3D) {

    this.root.add(obj);

    this.objects.push(obj);

    return obj;

  }


  mesh(

    geo: THREE.BufferGeometry,

    mat: THREE.Material,

    x: number,

    y: number,

    z: number,

    rx = 0,

    ry = 0,

    rz = 0,

  ) {

    const m = new THREE.Mesh(geo, mat);

    m.position.set(x, y, z);

    m.rotation.set(rx, ry, rz);

    m.castShadow = true;

    m.receiveShadow = true;

    this.add(m);

    return m;

  }


  box(

    mat: THREE.Material,

    x: number,

    y: number,

    z: number,

    w: number,

    h: number,

    d: number,

    ry = 0,

  ) {

    const g = new THREE.BoxGeometry(w, h, d);

    this.geos.push(g);

    return this.mesh(g, mat, x, y, z, 0, ry, 0);

  }


  cyl(

    mat: THREE.Material,

    x: number,

    y: number,

    z: number,

    rTop: number,

    rBot: number,

    h: number,

    seg = 18,

  ) {

    const g = new THREE.CylinderGeometry(rTop, rBot, h, seg);

    this.geos.push(g);

    return this.mesh(g, mat, x, y, z);

  }


  sphere(mat: THREE.Material, x: number, y: number, z: number, r: number, seg = 14) {

    const g = new THREE.SphereGeometry(r, seg, seg);

    this.geos.push(g);

    return this.mesh(g, mat, x, y, z);

  }


  solid(minX: number, maxX: number, minZ: number, maxZ: number, tag?: string) {

    this.colliders.push({ minX, maxX, minZ, maxZ, tag });

  }


  wall(x0: number, z0: number, x1: number, z1: number, y0 = 0, y1 = 2.4, collider = true) {

    const w = Math.max(Math.abs(x1 - x0), 0.04);

    const d = Math.max(Math.abs(z1 - z0), 0.04);

    const h = y1 - y0;

    this.box(this.mats.wall, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, w, h, d);

    if (collider) this.solid(Math.min(x0, x1), Math.max(x0, x1), Math.min(z0, z1), Math.max(z0, z1));

  }


  dispose() {

    for (const g of this.geos) g.dispose();

    for (const m of this.extraMats) m.dispose();

  }

}
