import type { SceneFile, SceneObject } from "./scene";

export type ViewMode = "orbit" | "walk" | "pano";
export type SpaceId = "apt" | "studio";

type State = {
  ready: boolean;
  started: boolean;
  view: ViewMode;
  space: SpaceId;
  nearby: string | null;
  floorName: string;
  locked: boolean;
  objects: SceneObject[];
  room: SceneFile["room"];
  importError: string | null;
  panoSpot: string;
  inspect: string | null;
  setReady(value: boolean): void;
  setStarted(value: boolean): void;
  setView(value: ViewMode): void;
  setSpace(value: SpaceId): void;
  setNearby(value: string | null): void;
  setFloorName(value: string): void;
  setLocked(value: boolean): void;
  setScene(value: SceneFile): void;
  setObjects(value: SceneObject[]): void;
  setImportError(value: string | null): void;
  setPanoSpot(value: string): void;
  setInspect(value: string | null): void;
};

const listeners = new Set<(state: State) => void>();
let state: State;

function update(patch: Partial<State>): void {
  state = { ...state, ...patch };
  for (const listener of listeners) listener(state);
}

state = {
  ready: false,
  started: false,
  view: "orbit",
  space: "apt",
  nearby: null,
  floorName: "1LDK",
  locked: false,
  objects: [],
  room: { width: 8, depth: 6, height: 2.4 },
  importError: null,
  panoSpot: "ldk",
  inspect: null,
  setReady: (ready) => update({ ready }),
  setStarted: (started) => update({ started }),
  setView: (view) => update({ view }),
  setSpace: (space) => update({ space, inspect: null }),
  setNearby: (nearby) => update({ nearby }),
  setFloorName: (floorName) => update({ floorName }),
  setLocked: (locked) => update({ locked }),
  setScene: (scene) => update({ room: scene.room, objects: scene.objects.map((object) => structuredClone(object)), importError: null }),
  setObjects: (objects) => update({ objects: objects.map((object) => structuredClone(object)) }),
  setImportError: (importError) => update({ importError }),
  setPanoSpot: (panoSpot) => update({ panoSpot }),
  setInspect: (inspect) => update({ inspect }),
};

export const useApt = {
  getState: (): State => state,
  subscribe(listener: (nextState: State) => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
