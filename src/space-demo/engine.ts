
import * as THREE from "three";

import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

import { attachEngine, engineApi, type EngineApi } from "./api";

import { buildArchitecture, type DoorHandle } from "./architecture";

import { buildFurniture } from "./furniture";

import { layoutPlaced, loadScene, type Placed } from "./glb";

import { createPanorama, PANO_SPOTS, STUDIO_PANO_SPOTS, type PanoSpotId } from "./panorama";

import { cloneScene, type SceneFile, type SceneObject } from "./scene";

import { Kit } from "./kit";

import {

  BZ, D, EYE, INTERACTS, PLAYER_R, PX, SPAWN, W, floorY, roomName, type Collider,

} from "./layout";

import { createMaterials } from "./materials";

import { buildStudio, ST, STUDIO_INTERACTS, studioRoomName } from "./studio";

import { useApt, type SpaceId, type ViewMode } from "./store";


const STEP = 1 / 60;

const SENS = 0.0022;

const WALK = 2.55;

const SPRINT = 3.9;


function circleAabb(px: number, pz: number, r: number, b: Collider): { x: number; z: number } {

  const cx = Math.min(Math.max(px, b.minX), b.maxX);

  const cz = Math.min(Math.max(pz, b.minZ), b.maxZ);

  const dx = px - cx;

  const dz = pz - cz;

  const d2 = dx * dx + dz * dz;

  if (d2 >= r * r) return { x: px, z: pz };

  if (d2 < 1e-8) {

    const left = px - b.minX;

    const right = b.maxX - px;

    const north = pz - b.minZ;

    const south = b.maxZ - pz;

    const m = Math.min(left, right, north, south);

    if (m === left) return { x: b.minX - r, z: pz };

    if (m === right) return { x: b.maxX + r, z: pz };

    if (m === north) return { x: px, z: b.minZ - r };

    return { x: px, z: b.maxZ + r };

  }

  const d = Math.sqrt(d2);

  const f = r / d;

  return { x: cx + dx * f, z: cz + dz * f };

}


function activeCollider(c: Collider, open: Record<string, number>) {

  if (!c.tag) return true;

  if (c.tag.startsWith("door:")) {

    const id = c.tag.slice(5);

    return (open[id] ?? 0) < 0.55;

  }

  if (c.tag === "balconyGlass") return (open.balcony ?? 0) < 0.55;

  return true;

}


export function createEngine(canvas: HTMLCanvasElement, wrap: HTMLElement): EngineApi {

  const mats = createMaterials();

  const scene = new THREE.Scene();

  scene.background = new THREE.Color("#efeae1");


  const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 80);

  camera.rotation.order = "YXZ";


  const renderer = new THREE.WebGLRenderer({

    canvas,

    antialias: true,

    powerPreference: "high-performance",

  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  renderer.shadowMap.enabled = true;

  renderer.shadowMap.type = THREE.PCFShadowMap;

  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  renderer.toneMappingExposure = 1.18;

  renderer.outputColorSpace = THREE.SRGBColorSpace;


  const hemi = new THREE.HemisphereLight("#fff6ea", "#c4b49a", 0.55);

  scene.add(hemi);

  const ambient = new THREE.AmbientLight("#f2ebe0", 0.28);

  scene.add(ambient);


  const sun = new THREE.DirectionalLight("#fff1d4", 2.35);

  sun.position.set(2.2, 8.5, 13.5);

  sun.castShadow = true;

  sun.shadow.mapSize.set(2048, 2048);

  sun.shadow.camera.near = 0.5;

  sun.shadow.camera.far = 36;

  sun.shadow.camera.left = -9;

  sun.shadow.camera.right = 9;

  sun.shadow.camera.top = 9;

  sun.shadow.camera.bottom = -9;

  sun.shadow.bias = -0.00025;

  sun.shadow.normalBias = 0.03;

  scene.add(sun);

  scene.add(sun.target);

  sun.target.position.set(3.6, 0, 3.2);


  const fill = new THREE.PointLight("#ffe8c8", 0.45, 9, 1.6);

  fill.position.set(2.1, 2.15, 3.4);

  scene.add(fill);

  const fill2 = new THREE.PointLight("#f0f4ff", 0.28, 6, 1.8);

  fill2.position.set(6.1, 2.1, 1.8);

  scene.add(fill2);


  const aptRoot = new THREE.Group();

  aptRoot.name = "apt";

  const studioRoot = new THREE.Group();

  studioRoot.name = "studio";

  studioRoot.visible = false;

  scene.add(aptRoot, studioRoot);


  const kit = new Kit(scene, mats, aptRoot);

  const doors = buildArchitecture(kit);

  buildFurniture(kit);

  const studioKit = new Kit(scene, mats, studioRoot);

  const studio = buildStudio(studioKit);


  const pano = createPanorama(renderer);

  scene.add(pano.cubeCam);


  let space: SpaceId = "apt";

  let disposed = false;

  const store = useApt.getState();

  store.setObjects([]);

  store.setImportError(null);

  store.setSpace("apt");

  store.setInspect(null);


  const aptLights = {

    bg: scene.background?.clone() ?? new THREE.Color("#efeae1"),

    env: 0.4,

    hemiSky: hemi.color.clone(),

    hemiGround: hemi.groundColor.clone(),

    hemiI: hemi.intensity,

    ambC: ambient.color.clone(),

    ambI: ambient.intensity,

    sunC: sun.color.clone(),

    sunI: sun.intensity,

    sunP: sun.position.clone(),

    fillC: fill.color.clone(),

    fillI: fill.intensity,

    fillP: fill.position.clone(),

    fill2C: fill2.color.clone(),

    fill2I: fill2.intensity,

    fill2P: fill2.position.clone(),

  };


  const pmrem = new THREE.PMREMGenerator(renderer);

  const roomEnv = new RoomEnvironment();

  const envMap = pmrem.fromScene(roomEnv, 0.04).texture;

  scene.environment = envMap;

  scene.environmentIntensity = 0.4;

  roomEnv.dispose();

  pmrem.dispose();


  const glbDisposers: Array<() => void> = [];

  const placedById = new Map<string, Placed>();

  let baseScene: SceneFile | null = null;

  let orbitTheta = 0.42;

  let orbitPhi = 0.62;

  let orbitDist = 13.5;

  const orbitTarget = new THREE.Vector3(3.9, 0.15, 3.0);


  function publishObjects() {

    store.setObjects([...placedById.values()].map((p) => p.spec));

  }


  function applyCamera(file: SceneFile) {

    orbitTarget.set(file.camera.orbitTarget[0], file.camera.orbitTarget[1], file.camera.orbitTarget[2]);

    orbitDist = file.camera.orbitDist;

    orbitTheta = file.camera.orbitTheta;

    orbitPhi = file.camera.orbitPhi;

  }


  void loadScene(kit)

    .then((result) => {

      if (disposed) {

        result.dispose();

        return;

      }

      glbDisposers.push(result.dispose);

      baseScene = cloneScene(result.scene);

      for (const p of result.placed) placedById.set(p.spec.id, p);

      applyCamera(result.scene);

      store.setScene(result.scene);

    })

    .catch((err: unknown) => {

      console.warn("[scene]", err);

      store.setImportError("シーンまたは3Dモデルを読み込めませんでした");

    });


  const marker = new THREE.Group();

  const body = new THREE.Mesh(

    new THREE.CylinderGeometry(0.14, 0.16, 0.95, 10),

    new THREE.MeshStandardMaterial({ color: "#5c4a3a", roughness: 0.7 }),

  );

  body.position.y = 0.62;

  const head = new THREE.Mesh(

    new THREE.SphereGeometry(0.13, 12, 12),

    new THREE.MeshStandardMaterial({ color: "#e8d4be", roughness: 0.65 }),

  );

  head.position.y = 1.22;

  marker.add(body, head);

  scene.add(marker);

  kit.geos.push(body.geometry, head.geometry);

  kit.extraMats.push(body.material as THREE.Material, head.material as THREE.Material);


  const keys = new Set<string>();

  const injected = new Set<string>();

  let injecting = false;

  const keyHas = (c: string) => (injecting ? injected.has(c) : keys.has(c));


  let px = SPAWN.x;

  let pz = SPAWN.z;

  let yaw = SPAWN.yaw;

  let pitch = -0.08;

  let vx = 0;

  let vz = 0;

  let bob = 0;

  let speed = 0;

  let touchX = 0;

  let touchY = 0;


  const openAmt: Record<string, number> = { bedroom: 0, bath: 0, toilet: 0, entrance: 0, balcony: 0 };

  const openTo: Record<string, number> = { ...openAmt };

  const doorById = new Map<string, DoorHandle>();

  for (const d of doors) doorById.set(d.id, d);


  let view: ViewMode = "orbit";

  let dragging = false;

  let dragMode: "look" | "orbit" | null = null;

  let lastPx = 0;

  let lastPy = 0;

  let acc = 0;

  let prevT = 0;

  let interactEdge = false;

  let panoLon = 0;

  let panoLat = 0;

  let panoFov = 70;

  let panoSpot: PanoSpotId = "ldk";

  const pointers = new Map<number, { x: number; y: number }>();

  let pinchDist = 0;


  function resize() {

    const w = wrap.clientWidth || window.innerWidth;

    const h = wrap.clientHeight || window.innerHeight;

    camera.aspect = w / Math.max(1, h);

    camera.updateProjectionMatrix();

    renderer.setSize(w, h, false);

  }

  resize();


  function setKeys(codes: string[]) {

    injected.clear();

    for (const c of codes) injected.add(c);

    injecting = codes.length > 0;

    if (injecting && view !== "walk") {

      view = "walk";

      store.setView("walk");

      store.setStarted(true);

    }

  }


  function collideApt(nx: number, nz: number) {

    let x = nx;

    let z = nz;

    for (const c of kit.colliders) {

      if (!activeCollider(c, openAmt)) continue;

      const r = circleAabb(x, z, PLAYER_R, c);

      x = r.x;

      z = r.z;

    }

    const pad = PLAYER_R + 0.02;

    x = Math.min(Math.max(x, pad - 0.2), W - pad + 0.2);

    if (z > D + 0.1 && x < PX + 0.15) {

      z = Math.min(z, D + 1.12 - pad);

      x = Math.min(Math.max(x, pad), PX - pad);

    } else {

      z = Math.min(Math.max(z, pad - 0.15), D - pad + 0.15);

    }

    return { x, z };

  }


  function collideStudio(nx: number, nz: number) {

    let x = nx;

    let z = nz;

    for (const c of studioKit.colliders) {

      const r = circleAabb(x, z, PLAYER_R, c);

      x = r.x;

      z = r.z;

    }

    const pad = PLAYER_R + 0.02;

    x = Math.min(Math.max(x, pad), ST.W - pad);

    z = Math.min(Math.max(z, pad), ST.D - pad);

    return { x, z };

  }


  function collide(nx: number, nz: number) {

    return space === "studio" ? collideStudio(nx, nz) : collideApt(nx, nz);

  }


  function currentSpots() {

    return space === "studio" ? STUDIO_PANO_SPOTS : PANO_SPOTS;

  }


  function applyInteract(id: string) {

    if (id === "monitor") {

      const on = studio.togglePlay();

      store.setNearby(on ? "編集モニター · 再生中" : "編集モニター");

      return;

    }

    if (id === "camera") {

      store.setInspect("camera");

      return;

    }

    if (id === "terminal") {

      store.setInspect("terminal");

      return;

    }

    openTo[id] = (openTo[id] ?? 0) > 0.5 ? 0 : 1;

  }


  function applySpaceLights() {

    if (space === "studio") {

      scene.background = new THREE.Color("#101218");

      scene.environmentIntensity = 0.22;

      hemi.color.set("#d7e4f2");

      hemi.groundColor.set("#16181e");

      hemi.intensity = 0.32;

      ambient.color.set("#10141a");

      ambient.intensity = 0.2;

      sun.color.set("#e8f0ff");

      sun.intensity = 1.05;

      sun.position.set(5, 9, -1.5);

      fill.color.set("#66e7ef");

      fill.intensity = 0.62;

      fill.position.set(2.2, 2.5, 2.7);

      fill2.color.set("#f4f7fb");

      fill2.intensity = 0.42;

      fill2.position.set(7.6, 2.6, 3.2);

      return;

    }

    scene.background = aptLights.bg.clone();

    scene.environmentIntensity = aptLights.env;

    hemi.color.copy(aptLights.hemiSky);

    hemi.groundColor.copy(aptLights.hemiGround);

    hemi.intensity = aptLights.hemiI;

    ambient.color.copy(aptLights.ambC);

    ambient.intensity = aptLights.ambI;

    sun.color.copy(aptLights.sunC);

    sun.intensity = aptLights.sunI;

    sun.position.copy(aptLights.sunP);

    fill.color.copy(aptLights.fillC);

    fill.intensity = aptLights.fillI;

    fill.position.copy(aptLights.fillP);

    fill2.color.copy(aptLights.fill2C);

    fill2.intensity = aptLights.fill2I;

    fill2.position.copy(aptLights.fill2P);

  }


  function spawnHere() {

    if (space === "studio") {

      px = ST.SPAWN.x;

      pz = ST.SPAWN.z;

      yaw = ST.SPAWN.yaw;

      orbitTarget.set(ST.ORBIT.target[0], ST.ORBIT.target[1], ST.ORBIT.target[2]);

      orbitDist = ST.ORBIT.dist;

      orbitTheta = ST.ORBIT.theta;

      orbitPhi = ST.ORBIT.phi;

    } else {

      px = SPAWN.x;

      pz = SPAWN.z;

      yaw = SPAWN.yaw;

      if (baseScene) applyCamera(baseScene);

      else {

        orbitTarget.set(3.9, 0.15, 3.0);

        orbitDist = 13.5;

        orbitTheta = 0.42;

        orbitPhi = 0.62;

      }

    }

    pitch = -0.08;

  }


  function switchSpace(next: SpaceId) {

    if (space === next && aptRoot.visible === (next === "apt")) {

      store.setSpace(next);

      return;

    }

    space = next;

    aptRoot.visible = next === "apt";

    studioRoot.visible = next === "studio";

    applySpaceLights();

    spawnHere();

    store.setSpace(next);

    store.setInspect(null);

    store.setFloorName(next === "studio" ? "スタジオ" : "1LDK");

    store.setNearby(null);

    if (view === "pano") enterPano(currentSpots()[0]?.id ?? "here");

  }


  function simulate(dt: number) {

    const st = useApt.getState();

    if (st.view !== view) view = st.view;


    for (const id of Object.keys(openTo)) {

      const t = openTo[id] ?? 0;

      const cur = openAmt[id] ?? 0;

      openAmt[id] = cur + (t - cur) * Math.min(1, 7 * dt);

      const door = doorById.get(id);

      if (!door) continue;

      if (door.type === "swing" && door.maxAngle != null) {

        door.group.rotation.y = openAmt[id] * door.maxAngle;

      } else if (door.type === "slide" && door.slideFrom != null && door.slideTravel != null) {

        door.group.position.x = door.slideFrom + openAmt[id] * door.slideTravel;

      }

    }


    let nearest: { id: string; x: number; z: number; r: number; label: string } | null = null;

    let best = 99;

    const interacts = space === "studio" ? STUDIO_INTERACTS : INTERACTS;

    for (const it of interacts) {

      const dist = Math.hypot(px - it.x, pz - it.z);

      if (dist < it.r && dist < best) {

        best = dist;

        nearest = it;

      }

    }

    const label = view === "walk" && nearest ? nearest.label : null;

    if (st.nearby !== label) store.setNearby(label);

    if (view !== "pano") {

      const rn = space === "studio" ? studioRoomName(px, pz) : roomName(px, pz);

      if (st.floorName !== rn) store.setFloorName(rn);

    }


    const wantInteract = keyHas("KeyE") || keyHas("KeyF");

    if (wantInteract && !interactEdge && nearest) {

      applyInteract(nearest.id);

    }

    interactEdge = wantInteract;


    const ceiling = space === "studio" ? studioKit.ceiling : kit.ceiling;

    if (ceiling) ceiling.visible = view === "walk";


    if (view !== "walk") {

      vx = 0;

      vz = 0;

      speed = 0;

      marker.visible = view === "orbit";

      if (view === "orbit") {

        marker.position.set(px, space === "studio" ? 0 : floorY(px, pz), pz);

        marker.rotation.y = yaw;

      }

      return;

    }

    marker.visible = false;


    let fwd = 0;

    let right = 0;

    if (keyHas("KeyW") || keyHas("ArrowUp")) fwd += 1;

    if (keyHas("KeyS") || keyHas("ArrowDown")) fwd -= 1;

    if (keyHas("KeyD") || keyHas("ArrowRight")) right += 1;

    if (keyHas("KeyA") || keyHas("ArrowLeft")) right -= 1;

    fwd += touchY;

    right += touchX;

    const mag = Math.hypot(fwd, right);

    if (mag > 1) {

      fwd /= mag;

      right /= mag;

    }


    const sprint = keyHas("ShiftLeft") || keyHas("ShiftRight");

    const max = sprint ? SPRINT : WALK;

    const fx = -Math.sin(yaw);

    const fz = -Math.cos(yaw);

    const rx = Math.cos(yaw);

    const rz = -Math.sin(yaw);

    const wishX = (fx * fwd + rx * right) * max;

    const wishZ = (fz * fwd + rz * right) * max;

    const k = Math.min(1, 14 * dt);

    vx += (wishX - vx) * k;

    vz += (wishZ - vz) * k;

    speed = Math.hypot(vx, vz);


    const next = collide(px + vx * dt, pz + vz * dt);

    px = next.x;

    pz = next.z;

    if (speed > 0.35) bob += dt * 9.5 * (speed / WALK);

    else bob *= 1 - Math.min(1, 8 * dt);

  }


  function applyWalkCamera() {

    const fy = space === "studio" ? 0 : floorY(px, pz);

    const bobY = Math.sin(bob) * 0.028 * Math.min(1, speed / WALK);

    camera.near = 0.05;

    camera.far = 80;

    camera.fov = 60;

    camera.updateProjectionMatrix();

    camera.position.set(px, fy + EYE + bobY, pz);

    camera.rotation.set(pitch, yaw, 0, "YXZ");

  }


  function applyOrbitCamera(dt: number) {

    const st = useApt.getState();

    if (!st.started) orbitTheta += dt * 0.12;

    camera.near = 0.05;

    camera.far = 80;

    camera.fov = 46;

    camera.updateProjectionMatrix();

    const phi = THREE.MathUtils.clamp(orbitPhi, 0.35, 1.25);

    camera.position.set(

      orbitTarget.x + orbitDist * Math.sin(phi) * Math.sin(orbitTheta),

      orbitTarget.y + orbitDist * Math.cos(phi),

      orbitTarget.z + orbitDist * Math.sin(phi) * Math.cos(orbitTheta),

    );

    camera.lookAt(orbitTarget);

  }


  function applyPanoCamera() {

    panoLat = THREE.MathUtils.clamp(panoLat, -85, 85);

    camera.near = 1;

    camera.far = 1100;

    camera.fov = panoFov;

    camera.updateProjectionMatrix();

    camera.position.set(0, 0, 0);

    const phi = THREE.MathUtils.degToRad(90 - panoLat);

    const theta = THREE.MathUtils.degToRad(panoLon);

    camera.lookAt(Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta));

  }


  function spotLabel(id: PanoSpotId) {

    if (id === "here") return "歩行位置";

    return currentSpots().find((s) => s.id === id)?.label ?? "360°";

  }


  function shootPano(spot: PanoSpotId) {

    panoSpot = spot;

    let x = px;

    let y = (space === "studio" ? 0 : floorY(px, pz)) + EYE;

    let z = pz;

    if (spot !== "here") {

      const spots = currentSpots();

      const s = spots.find((p) => p.id === spot) ?? spots[0];

      x = s.x;

      y = s.y;

      z = s.z;

    }

    const hide: THREE.Object3D[] = [marker];

    const ceiling = space === "studio" ? studioKit.ceiling : kit.ceiling;

    const ceilingWas = ceiling?.visible ?? false;

    if (ceiling) ceiling.visible = true;

    pano.capture(scene, x, y, z, hide);

    if (ceiling) ceiling.visible = ceilingWas;

    store.setPanoSpot(spot);

    store.setFloorName(`360° · ${spotLabel(spot)}`);

  }


  function enterPano(spot: PanoSpotId = "ldk") {

    document.exitPointerLock?.();

    const spots = currentSpots();

    if (spot !== "here" && !spots.some((s) => s.id === spot)) {

      spot = spots[0]?.id ?? "here";

    }

    shootPano(spot);

    if (spot === "here") {
      panoLon = THREE.MathUtils.radToDeg(-yaw - Math.PI / 2);
      panoLat = THREE.MathUtils.radToDeg(pitch);
    } else if (spot === "ldk" || spot === "shoot") {

      panoLon = 90;

      panoLat = -4;

    } else if (spot === "bed" || spot === "meet") {

      panoLon = 200;

      panoLat = -4;

    } else if (spot === "desk") {

      panoLon = 20;

      panoLat = -8;

    } else {

      panoLon = 20;

      panoLat = -4;

    }

    panoFov = 70;

    view = "pano";

    store.setView("pano");

    store.setStarted(true);

    store.setNearby(null);

    store.setInspect(null);

  }


  function loop(t: number) {

    if (disposed) return;

    if (!prevT) prevT = t;

    const dt = Math.min((t - prevT) / 1000, 0.1);

    prevT = t;

    acc += dt;

    let steps = 0;

    while (acc >= STEP && steps < 6) {

      simulate(STEP);

      acc -= STEP;

      steps++;

    }

    if (space === "studio") studio.tick(t);

    if (view === "walk") applyWalkCamera();

    else if (view === "pano") applyPanoCamera();

    else applyOrbitCamera(dt);

    renderer.render(view === "pano" ? pano.panoScene : scene, camera);

  }


  function onKeyDown(e: KeyboardEvent) {

    keys.add(e.code);

    if (["KeyW", "KeyA", "KeyS", "KeyD", "Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {

      e.preventDefault();

    }

  }

  function onKeyUp(e: KeyboardEvent) {

    keys.delete(e.code);

  }

  function clearKeys() {

    keys.clear();

  }


  function onPointerDown(e: PointerEvent) {

    if ((e.target as HTMLElement | null)?.closest?.("[data-ui]")) return;

    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (view === "pano" && pointers.size >= 2) {

      const pts = [...pointers.values()];

      const a = pts[0];

      const b = pts[1];

      if (a && b) pinchDist = Math.hypot(a.x - b.x, a.y - b.y);

      dragging = false;

      dragMode = null;

      return;

    }

    dragging = true;

    dragMode = view === "orbit" ? "orbit" : "look";

    lastPx = e.clientX;

    lastPy = e.clientY;

    wrap.setPointerCapture(e.pointerId);

    if (view === "walk" && e.pointerType === "mouse") {

      canvas.requestPointerLock?.().catch(() => undefined);

    }

  }

  function onPointerMove(e: PointerEvent) {

    if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (view === "pano" && pointers.size >= 2) {

      const pts = [...pointers.values()];

      const a = pts[0];

      const b = pts[1];

      if (a && b) {

        const d = Math.hypot(a.x - b.x, a.y - b.y);

        if (pinchDist > 8 && d > 8) {

          panoFov = THREE.MathUtils.clamp(panoFov * (pinchDist / d), 28, 90);

        }

        pinchDist = d;

      }

      return;

    }

    if (document.pointerLockElement === canvas) {

      yaw -= e.movementX * SENS;

      pitch -= e.movementY * SENS;

      pitch = Math.max(-1.42, Math.min(1.42, pitch));

      return;

    }

    if (!dragging || !dragMode) return;

    const dx = e.clientX - lastPx;

    const dy = e.clientY - lastPy;

    lastPx = e.clientX;

    lastPy = e.clientY;

    if (dragMode === "look") {

      if (view === "pano") {

        panoLon -= dx * 0.12;

        panoLat += dy * 0.12;

        panoLat = THREE.MathUtils.clamp(panoLat, -85, 85);

      } else {

        yaw -= dx * SENS * 1.15;

        pitch -= dy * SENS * 1.15;

        pitch = Math.max(-1.42, Math.min(1.42, pitch));

      }

    } else {

      orbitTheta -= dx * 0.005;

      orbitPhi -= dy * 0.004;

    }

  }

  function onPointerUp(e: PointerEvent) {

    pointers.delete(e.pointerId);

    if (pointers.size < 2) pinchDist = 0;

    dragging = false;

    dragMode = null;

    try {

      wrap.releasePointerCapture(e.pointerId);

    } catch {

      /* ignore */

    }

  }

  function onWheel(e: WheelEvent) {

    if (view === "pano") {

      panoFov = THREE.MathUtils.clamp(panoFov + e.deltaY * 0.05, 28, 90);

      return;

    }

    if (view !== "orbit") return;

    orbitDist = THREE.MathUtils.clamp(orbitDist + e.deltaY * 0.01, 5.5, space === "studio" ? 20 : 16);

  }

  function onLockChange() {

    store.setLocked(document.pointerLockElement === canvas);

  }


  const ro = new ResizeObserver(resize);

  ro.observe(wrap);

  window.addEventListener("keydown", onKeyDown);

  window.addEventListener("keyup", onKeyUp);

  window.addEventListener("blur", clearKeys);

  document.addEventListener("visibilitychange", () => {

    if (document.hidden) clearKeys();

  });

  wrap.addEventListener("pointerdown", onPointerDown);

  window.addEventListener("pointermove", onPointerMove);

  window.addEventListener("pointerup", onPointerUp);

  wrap.addEventListener("wheel", onWheel, { passive: true });

  document.addEventListener("pointerlockchange", onLockChange);


  renderer.setAnimationLoop(loop);

  store.setReady(true);


  const api: EngineApi = {

    enterWalk() {

      view = "walk";

      store.setView("walk");

      store.setStarted(true);

      spawnHere();

      pitch = -0.06;

    },

    enterOrbit() {

      view = "orbit";

      store.setView("orbit");

      store.setStarted(true);

      document.exitPointerLock?.();

    },

    enterPano(spot: PanoSpotId = "ldk") {

      enterPano(spot);

    },

    enterSpace(next) {

      switchSpace(next);

    },

    setView(v) {

      if (v === "pano") {

        enterPano(view === "walk" ? "here" : "ldk");

        return;

      }

      view = v;

      store.setView(v);

      store.setStarted(true);

      if (v === "orbit") document.exitPointerLock?.();

    },

    toggleNearby() {

      const st = useApt.getState();

      const list = space === "studio" ? STUDIO_INTERACTS : INTERACTS;

      const n = list.find((i) => i.label === st.nearby || st.nearby?.startsWith(i.label));

      if (!n) return;

      applyInteract(n.id);

    },

    teleport(x, z, y) {

      px = x;

      pz = z;

      yaw = y;

      view = "walk";

      store.setView("walk");

      store.setStarted(true);

    },

    setTouch(x, y) {

      touchX = x;

      touchY = y;

    },

    moveObject(id, patch) {

      const p = placedById.get(id);

      if (!p) return;

      if (patch.position) {

        p.spec.position = [

          THREE.MathUtils.clamp(patch.position[0], -0.2, 8.2),

          THREE.MathUtils.clamp(patch.position[1], 0, 2.2),

          THREE.MathUtils.clamp(patch.position[2], -0.2, 7.4),

        ];

      }

      if (patch.rotation) {

        p.spec.rotation = [patch.rotation[0], patch.rotation[1], patch.rotation[2]];

      }

      if (patch.fitHeight != null) {

        p.spec.fitHeight = THREE.MathUtils.clamp(patch.fitHeight, 0.06, 1.4);

      }

      layoutPlaced(p);

      publishObjects();

    },

    resetScene() {

      if (!baseScene) return;

      applyCamera(baseScene);

      for (const orig of baseScene.objects) {

        const p = placedById.get(orig.id);

        if (!p) continue;

        p.spec = structuredClone(orig);

        layoutPlaced(p);

      }

      publishObjects();

    },

    lookAtObject(id) {

      if (space !== "apt") return;

      const p = placedById.get(id);

      if (!p) return;

      const [x, , z] = p.spec.position;

      let standX = THREE.MathUtils.clamp(x, 0.45, W - 0.45);

      let standZ = z + 1.05;

      let standYaw = 0;

      if (x > PX && z < BZ) {

        standX = THREE.MathUtils.clamp(x, PX + 0.4, W - 0.4);

        standZ = Math.min(BZ - 0.4, z + 0.95);

        if (standZ <= z + 0.35) {

          standZ = Math.max(0.4, z - 0.95);

          standYaw = Math.PI;

        }

      }

      px = standX;

      pz = THREE.MathUtils.clamp(standZ, 0.4, D - 0.35);

      yaw = standYaw;

      pitch = -0.12;

      view = "walk";

      store.setView("walk");

      store.setStarted(true);

    },

    applyObjects(objects) {

      for (const spec of objects) {

        const p = placedById.get(spec.id);

        if (!p) continue;

        api.moveObject(spec.id, {

          position: spec.position,

          rotation: spec.rotation,

          fitHeight: spec.fitHeight,

        });

      }

    },

    dispose() {

      disposed = true;

      renderer.setAnimationLoop(null);

      ro.disconnect();

      window.removeEventListener("keydown", onKeyDown);

      window.removeEventListener("keyup", onKeyUp);

      window.removeEventListener("blur", clearKeys);

      wrap.removeEventListener("pointerdown", onPointerDown);

      window.removeEventListener("pointermove", onPointerMove);

      window.removeEventListener("pointerup", onPointerUp);

      wrap.removeEventListener("wheel", onWheel);

      document.removeEventListener("pointerlockchange", onLockChange);

      for (const d of glbDisposers) d();

      studio.dispose();

      pano.dispose();

      envMap.dispose();

      kit.dispose();

      studioKit.dispose();

      mats.dispose();

      renderer.dispose();

      if (engineApi.current === api) attachEngine(null);

    },

  };


  attachEngine(api);


  window.__controlsTest = {

    getYaw: () => yaw,

    getSpeed: () => speed,

    getX: () => px,

    getZ: () => pz,

    setKeys,

    setSteer(v: number) {

      yaw += v * 0.00001;

    },

    teleport: (x: number, z: number, y: number) => {

      px = x;

      pz = z;

      yaw = y;

      view = "walk";

      store.setView("walk");

      store.setStarted(true);

    },

    moveObject: (id: string, patch: { position?: [number, number, number]; rotation?: [number, number, number]; fitHeight?: number }) => {

      api.moveObject(id, patch);

    },

    getObject: (id: string) => placedById.get(id)?.spec,

    applyObjects: (objects: SceneObject[]) => {

      api.applyObjects(objects);

    },

    enterPano: (spot?: PanoSpotId) => enterPano(spot ?? "ldk"),

    getPanoLon: () => panoLon,

    getPanoLat: () => panoLat,

    setPanoLook: (lon: number, lat: number, fov?: number) => {

      panoLon = lon;

      panoLat = lat;

      if (fov != null) panoFov = fov;

    },

    enterSpace: (next: SpaceId) => switchSpace(next),

    getSpace: () => space,

  };


  return api;

}


declare global {

  interface Window {

    __controlsTest?: {

      getYaw: () => number;

      getSpeed: () => number;

      getX?: () => number;

      getZ?: () => number;

      setKeys?: (codes: string[]) => void;

      setSteer?: (v: number) => void;

      teleport?: (x: number, z: number, yaw: number) => void;

      moveObject?: (

        id: string,

        patch: { position?: [number, number, number]; rotation?: [number, number, number]; fitHeight?: number },

      ) => void;

      getObject?: (id: string) =>

        | { id: string; position: [number, number, number]; rotation: [number, number, number]; fitHeight?: number }

        | undefined;

      applyObjects?: (objects: SceneObject[]) => void;

      enterPano?: (spot?: PanoSpotId) => void;

      getPanoLon?: () => number;

      getPanoLat?: () => number;

      setPanoLook?: (lon: number, lat: number, fov?: number) => void;

      enterSpace?: (space: SpaceId) => void;

      getSpace?: () => SpaceId;

    };

  }

}
