
import * as THREE from "three";


function canvasTex(

  w: number,

  h: number,

  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,

  repeatX = 1,

  repeatY = 1,

) {

  const c = document.createElement("canvas");

  c.width = w;

  c.height = h;

  const ctx = c.getContext("2d");

  if (!ctx) throw new Error("canvas");

  draw(ctx, w, h);

  const tex = new THREE.CanvasTexture(c);

  tex.colorSpace = THREE.SRGBColorSpace;

  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;

  tex.repeat.set(repeatX, repeatY);

  tex.anisotropy = 8;

  tex.needsUpdate = true;

  return tex;

}


function woodGrain(ctx: CanvasRenderingContext2D, w: number, h: number, a: string, b: string) {

  ctx.fillStyle = a;

  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 48; i++) {

    ctx.strokeStyle = b;

    ctx.globalAlpha = 0.08 + (i % 7) * 0.015;

    ctx.lineWidth = 1 + (i % 3);

    ctx.beginPath();

    const y = (i / 48) * h + Math.sin(i * 1.7) * 4;

    ctx.moveTo(0, y);

    ctx.bezierCurveTo(w * 0.3, y + 6, w * 0.6, y - 5, w, y + 2);

    ctx.stroke();

  }

  ctx.globalAlpha = 0.05;

  for (let i = 0; i < 180; i++) {

    ctx.fillStyle = i % 2 ? "#5a3a18" : "#d8c09a";

    ctx.fillRect((i * 47) % w, (i * 29) % h, 2, 1);

  }

  ctx.globalAlpha = 1;

}


function tileGrid(ctx: CanvasRenderingContext2D, w: number, h: number) {

  ctx.fillStyle = "#d8d3cb";

  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = "#c0bab0";

  ctx.lineWidth = 2;

  const step = 64;

  for (let x = 0; x <= w; x += step) {

    ctx.beginPath();

    ctx.moveTo(x, 0);

    ctx.lineTo(x, h);

    ctx.stroke();

  }

  for (let y = 0; y <= h; y += step) {

    ctx.beginPath();

    ctx.moveTo(0, y);

    ctx.lineTo(w, y);

    ctx.stroke();

  }

  ctx.fillStyle = "rgba(255,255,255,0.08)";

  for (let x = 0; x < w; x += step) {

    for (let y = 0; y < h; y += step) {

      ctx.fillRect(x + 4, y + 4, step - 8, 6);

    }

  }

}


export type Mats = ReturnType<typeof createMaterials>;


export function createMaterials() {

  const woodMap = canvasTex(512, 512, (ctx, w, h) => woodGrain(ctx, w, h, "#c9a06a", "#6b4220"), 4, 4);

  const woodMap2 = canvasTex(512, 512, (ctx, w, h) => woodGrain(ctx, w, h, "#b68a55", "#5a3416"), 3, 3);

  const tileMap = canvasTex(512, 512, tileGrid, 3, 3);

  const tileDarkMap = canvasTex(

    512,

    512,

    (ctx, w, h) => {

      ctx.fillStyle = "#6e6a64";

      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = "#5a564f";

      ctx.lineWidth = 2;

      for (let x = 0; x <= w; x += 48) {

        ctx.beginPath();

        ctx.moveTo(x, 0);

        ctx.lineTo(x, h);

        ctx.stroke();

      }

      for (let y = 0; y <= h; y += 48) {

        ctx.beginPath();

        ctx.moveTo(0, y);

        ctx.lineTo(w, y);

        ctx.stroke();

      }

    },

    2,

    2,

  );

  const tvMap = canvasTex(256, 144, (ctx, w, h) => {

    const g = ctx.createLinearGradient(0, 0, 0, h);

    g.addColorStop(0, "#6d8498");

    g.addColorStop(0.42, "#d4c3a4");

    g.addColorStop(1, "#3e4a36");

    ctx.fillStyle = g;

    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "#f2e4c4";

    ctx.beginPath();

    ctx.arc(w * 0.74, h * 0.32, 14, 0, Math.PI * 2);

    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.15)";

    ctx.fillRect(0, 0, w, 18);

  });

  const laptopMap = canvasTex(256, 160, (ctx, w, h) => {

    ctx.fillStyle = "#1b1f24";

    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "#c8a46a";

    ctx.font = "22px monospace";

    ctx.fillText("1LDK", 18, 48);

    ctx.fillStyle = "#8a9a7a";

    ctx.font = "11px monospace";

    ctx.fillText("walk();  open(door);", 18, 78);

    ctx.fillText("light.from('south');", 18, 96);

    ctx.fillStyle = "#3d4a3a";

    ctx.fillRect(0, h - 22, w, 22);

  });


  const std = (color: number | string, extras: THREE.MeshStandardMaterialParameters = {}) =>

    new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0, ...extras });


  const mats = {

    wall: std("#f3f0e8", { roughness: 0.88 }),

    trim: std("#d7c7aa", { roughness: 0.55 }),

    woodFloor: std("#e4d0ae", { map: woodMap, roughness: 0.52 }),

    woodFloorBed: std("#e8d4b4", { map: woodMap2, roughness: 0.54 }),

    tile: std("#e4dfd6", { map: tileMap, roughness: 0.35 }),

    tileDark: std("#88847c", { map: tileDarkMap, roughness: 0.4 }),

    wood: std("#c4a074", { roughness: 0.5 }),

    woodDark: std("#6e4e36", { roughness: 0.55 }),

    fabric: std("#8d8478", { roughness: 0.82 }),

    fabricDark: std("#6f675c", { roughness: 0.85 }),

    linen: std("#ece6dc", { roughness: 0.78 }),

    pillow: std("#f4efe6", { roughness: 0.8 }),

    black: std("#1a1a1a", { roughness: 0.35, metalness: 0.2 }),

    screen: std("#1a1a1a", { map: tvMap, emissive: "#ffffff", emissiveMap: tvMap, emissiveIntensity: 0.55, roughness: 0.3 }),

    laptop: std("#111", { map: laptopMap, emissive: "#ffffff", emissiveMap: laptopMap, emissiveIntensity: 0.45, roughness: 0.35 }),

    metal: std("#c5c8cc", { roughness: 0.28, metalness: 0.72 }),

    metalDark: std("#4a4e52", { roughness: 0.35, metalness: 0.6 }),

    glass: new THREE.MeshStandardMaterial({

      color: "#cfe4f2",

      roughness: 0.08,

      metalness: 0.1,

      transparent: true,

      opacity: 0.22,

      depthWrite: false,

    }),

    plant: std("#3c6b44", { roughness: 0.75 }),

    plantDark: std("#2a4f32", { roughness: 0.78 }),

    pot: std("#8a5a3c", { roughness: 0.7 }),

    white: std("#f6f4f0", { roughness: 0.55 }),

    ih: std("#161616", { roughness: 0.25, metalness: 0.4 }),

    balcony: std("#b7b1a6", { roughness: 0.62 }),

    ceiling: std("#f7f5f0", { roughness: 0.92 }),

    soil: std("#3a2a1c", { roughness: 1 }),

    curtain: std("#d8cfc2", { roughness: 0.9, side: THREE.DoubleSide }),

    porcelain: std("#f3f1ec", { roughness: 0.25, metalness: 0.05 }),

    water: std("#8eb8c8", { roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.55 }),

    textures: [woodMap, woodMap2, tileMap, tileDarkMap, tvMap, laptopMap],

    dispose() {

      for (const m of Object.values(this)) {

        if (m instanceof THREE.Material) m.dispose();

      }

      for (const t of this.textures) t.dispose();

    },

  };


  return mats;

}
