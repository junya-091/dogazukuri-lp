import type { SceneObject } from "./scene";
import type { PanoSpotId } from "./panorama";
import type { SpaceId, ViewMode } from "./store";

export type ObjectPatch = {
  position?: SceneObject["position"];
  rotation?: SceneObject["rotation"];
  fitHeight?: number;
};

export type EngineApi = {
  enterWalk: () => void;
  enterOrbit: () => void;
  enterPano: (spot?: PanoSpotId) => void;
  enterSpace: (space: SpaceId) => void;
  setView: (view: ViewMode) => void;
  toggleNearby: () => void;
  teleport: (x: number, z: number, yaw: number) => void;
  setTouch: (x: number, y: number) => void;
  moveObject: (id: string, patch: ObjectPatch) => void;
  resetScene: () => void;
  lookAtObject: (id: string) => void;
  applyObjects: (objects: SceneObject[]) => void;
  dispose: () => void;
};

export const engineApi: { current: EngineApi | null } = { current: null };
const pending: Array<(engine: EngineApi) => void> = [];

export function attachEngine(engine: EngineApi | null): void {
  engineApi.current = engine;
  if (!engine) return;
  for (const call of pending.splice(0)) call(engine);
}

export function callEngine<K extends keyof EngineApi>(method: K, ...args: Parameters<EngineApi[K]>): void {
  const engine = engineApi.current;
  if (engine) {
    (engine[method] as (...values: Parameters<EngineApi[K]>) => void)(...args);
    return;
  }
  pending.push((attached) => {
    (attached[method] as (...values: Parameters<EngineApi[K]>) => void)(...args);
  });
}
