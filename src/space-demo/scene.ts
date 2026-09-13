
export type Vec3 = [number, number, number];


export type SceneObject = {

  id: string;

  label: string;

  model?: string;

  prop?: string;

  position: Vec3;

  rotation: Vec3;

  scale?: Vec3;

  fitHeight?: number;

};


export type SceneFile = {

  room: { width: number; depth: number; height: number };

  camera: {

    orbitTarget: Vec3;

    orbitDist: number;

    orbitTheta: number;

    orbitPhi: number;

  };

  objects: SceneObject[];

};


function num(v: unknown, fallback: number) {

  return typeof v === "number" && Number.isFinite(v) ? v : fallback;

}


function vec3(v: unknown, fallback: Vec3): Vec3 {

  if (!Array.isArray(v) || v.length < 3) return [...fallback] as Vec3;

  return [num(v[0], fallback[0]), num(v[1], fallback[1]), num(v[2], fallback[2])];

}


export const EMPTY_SCENE: SceneFile = {

  room: { width: 8, depth: 6, height: 2.4 },

  camera: {

    orbitTarget: [3.9, 0.15, 3.0],

    orbitDist: 13.5,

    orbitTheta: 0.42,

    orbitPhi: 0.62,

  },

  objects: [],

};


export function parseScene(raw: unknown): SceneFile {

  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  const roomIn = o.room && typeof o.room === "object" ? (o.room as Record<string, unknown>) : {};

  const camIn = o.camera && typeof o.camera === "object" ? (o.camera as Record<string, unknown>) : {};

  const list = Array.isArray(o.objects) ? o.objects : [];


  const objects: SceneObject[] = [];

  for (const item of list) {

    if (!item || typeof item !== "object") continue;

    const it = item as Record<string, unknown>;

    if (typeof it.id !== "string") continue;

    const hasModel = typeof it.model === "string" && it.model.length > 0;

    const hasProp = typeof it.prop === "string" && it.prop.length > 0;

    if (!hasModel && !hasProp) continue;

    const obj: SceneObject = {

      id: it.id,

      label: typeof it.label === "string" ? it.label : it.id,

      position: vec3(it.position, [0, 0, 0]),

      rotation: vec3(it.rotation, [0, 0, 0]),

    };

    if (hasModel) obj.model = it.model as string;

    if (hasProp) obj.prop = it.prop as string;

    if (Array.isArray(it.scale) && it.scale.length >= 3) obj.scale = vec3(it.scale, [1, 1, 1]);

    if (typeof it.fitHeight === "number" && it.fitHeight > 0) obj.fitHeight = it.fitHeight;

    objects.push(obj);

  }


  return {

    room: {

      width: num(roomIn.width, 8),

      depth: num(roomIn.depth, 6),

      height: num(roomIn.height, 2.4),

    },

    camera: {

      orbitTarget: vec3(camIn.orbitTarget, EMPTY_SCENE.camera.orbitTarget),

      orbitDist: num(camIn.orbitDist, 13.5),

      orbitTheta: num(camIn.orbitTheta, 0.42),

      orbitPhi: num(camIn.orbitPhi, 0.62),

    },

    objects,

  };

}


export function mergeObjectUpdates(current: SceneObject[], generated: unknown): SceneObject[] {

  if (!Array.isArray(generated)) return current.map((o) => structuredClone(o));

  return current.map((cur) => {

    const match = generated.find((item) => {

      if (!item || typeof item !== "object") return false;

      return (item as { id?: unknown }).id === cur.id;

    }) as Record<string, unknown> | undefined;

    if (!match) return structuredClone(cur);

    const next: SceneObject = {

      ...structuredClone(cur),

      position: vec3(match.position, cur.position),

      rotation: vec3(match.rotation, cur.rotation),

    };

    if (typeof match.fitHeight === "number" && match.fitHeight > 0 && cur.fitHeight != null) {

      next.fitHeight = match.fitHeight;

    }

    return next;

  });

}


export function cloneScene(scene: SceneFile): SceneFile {

  return structuredClone(scene);

}


export function objectSnippet(obj: SceneObject) {

  const body: Record<string, unknown> = {

    id: obj.id,

    position: obj.position.map((n) => Number(n.toFixed(2))),

    rotation: obj.rotation.map((n) => Number(n.toFixed(2))),

  };

  if (obj.prop) body.prop = obj.prop;

  if (obj.model) body.model = obj.model;

  if (obj.fitHeight != null) body.fitHeight = obj.fitHeight;

  return JSON.stringify(body, null, 2);

}


export function objectsEqualish(a: SceneObject, b: SceneObject) {

  return (

    a.position[0] === b.position[0] &&

    a.position[1] === b.position[1] &&

    a.position[2] === b.position[2] &&

    a.rotation[0] === b.rotation[0] &&

    a.rotation[1] === b.rotation[1] &&

    a.rotation[2] === b.rotation[2] &&

    a.fitHeight === b.fitHeight

  );

}
