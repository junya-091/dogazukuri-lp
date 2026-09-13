
import * as THREE from "three";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import type { Kit } from "./kit";

import type { Collider } from "./layout";

import { buildProp } from "./props";

import { cloneScene, parseScene, type SceneFile, type SceneObject } from "./scene";


export type Placed = {

  spec: SceneObject;

  wrapper: THREE.Group;

  collider?: Collider;

};


const _box = new THREE.Box3();

const _size = new THREE.Vector3();


function stripCamerasAndLights(root: THREE.Object3D) {

  const drop: THREE.Object3D[] = [];

  root.traverse((o) => {

    if ((o as THREE.Camera).isCamera || (o as THREE.Light).isLight) drop.push(o);

  });

  for (const o of drop) o.removeFromParent();

}


function meshBox(root: THREE.Object3D, out: THREE.Box3) {

  out.makeEmpty();

  root.updateMatrixWorld(true);

  root.traverse((o) => {

    const m = o as THREE.Mesh;

    if (m.isMesh && m.geometry) out.expandByObject(m);

  });

  return out;

}


function syncCollider(placed: Placed) {

  if (!placed.collider) return;

  meshBox(placed.wrapper, _box);

  if (_box.isEmpty()) return;

  placed.collider.minX = _box.min.x;

  placed.collider.maxX = _box.max.x;

  placed.collider.minZ = _box.min.z;

  placed.collider.maxZ = _box.max.z;

}


export function layoutPlaced(placed: Placed) {

  const { wrapper, spec } = placed;

  wrapper.position.set(0, 0, 0);

  wrapper.rotation.set(0, 0, 0);

  wrapper.scale.set(1, 1, 1);


  meshBox(wrapper, _box);

  _box.getSize(_size);

  if (spec.fitHeight && spec.fitHeight > 0 && _size.y > 1e-5) {

    wrapper.scale.setScalar(spec.fitHeight / _size.y);

  } else if (spec.scale) {

    wrapper.scale.set(spec.scale[0], spec.scale[1], spec.scale[2]);

  }


  wrapper.rotation.set(spec.rotation[0], spec.rotation[1], spec.rotation[2]);

  wrapper.updateMatrixWorld(true);

  meshBox(wrapper, _box);

  if (_box.isEmpty()) {

    wrapper.position.set(spec.position[0], spec.position[1], spec.position[2]);

    syncCollider(placed);

    return;

  }

  wrapper.position.set(

    spec.position[0] - (_box.min.x + _box.max.x) * 0.5,

    spec.position[1] - _box.min.y,

    spec.position[2] - (_box.min.z + _box.max.z) * 0.5,

  );

  syncCollider(placed);

}


async function loadGlb(loader: GLTFLoader, spec: SceneObject, geos: THREE.BufferGeometry[], mats: THREE.Material[]) {

  const gltf = await loader.loadAsync(spec.model!);

  stripCamerasAndLights(gltf.scene);

  const wrapper = new THREE.Group();

  wrapper.name = spec.id;

  wrapper.add(gltf.scene);

  wrapper.traverse((obj) => {

    const mesh = obj as THREE.Mesh;

    if (!mesh.isMesh) return;

    mesh.castShadow = true;

    mesh.receiveShadow = true;

    if (mesh.geometry) geos.push(mesh.geometry);

    const mat = mesh.material;

    if (Array.isArray(mat)) mats.push(...mat);

    else if (mat) mats.push(mat);

  });

  return wrapper;

}


export async function loadScene(

  kit: Kit,

  url = "scenes/scene.json",

): Promise<{

  scene: SceneFile;

  placed: Placed[];

  dispose: () => void;

}> {

  const res = await fetch(url);

  if (!res.ok) throw new Error(`scene.json ${res.status}`);

  const scene = parseScene(await res.json());

  const loader = new GLTFLoader();

  const placed: Placed[] = [];

  const geos: THREE.BufferGeometry[] = [];

  const mats: THREE.Material[] = [];


  for (const spec of scene.objects) {

    let wrapper: THREE.Group | null = null;

    if (spec.prop) {

      wrapper = buildProp(kit, spec.prop);

    } else if (spec.model) {

      wrapper = await loadGlb(loader, spec, geos, mats);

    }

    if (!wrapper) continue;

    wrapper.name = spec.id;


    const item: Placed = { spec: structuredClone(spec), wrapper };

    if (spec.prop) {

      const collider: Collider = { minX: 0, maxX: 0, minZ: 0, maxZ: 0 };

      kit.colliders.push(collider);

      item.collider = collider;

    }

    layoutPlaced(item);

    kit.add(wrapper);

    placed.push(item);

  }


  return {

    scene: cloneScene(scene),

    placed,

    dispose() {

      for (const p of placed) p.wrapper.removeFromParent();

      for (const g of geos) g.dispose();

      for (const m of mats) m.dispose();

    },

  };

}
