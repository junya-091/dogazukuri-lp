
import * as THREE from "three";


export const PANO_SPOTS = [

  { id: "ldk", label: "リビング", x: 2.15, y: 1.52, z: 3.5 },

  { id: "dining", label: "ダイニング", x: 1.18, y: 1.52, z: 2.38 },

  { id: "bed", label: "洋室", x: 6.18, y: 1.52, z: 2.18 },

] as const;


export const STUDIO_PANO_SPOTS = [

  { id: "desk", label: "デスク", x: 2.45, y: 1.52, z: 2.72 },

  { id: "shoot", label: "撮影", x: 5.0, y: 1.52, z: 3.55 },

  { id: "meet", label: "ミーティング", x: 2.2, y: 1.52, z: 5.2 },

] as const;


export type PanoSpotId =

  | (typeof PANO_SPOTS)[number]["id"]

  | (typeof STUDIO_PANO_SPOTS)[number]["id"]

  | "here";


const CUBE = 512;

const EQ_W = 2048;

const EQ_H = 1024;


export function createPanorama(renderer: THREE.WebGLRenderer) {

  const cubeRT = new THREE.WebGLCubeRenderTarget(CUBE, {

    type: THREE.UnsignedByteType,

    colorSpace: THREE.SRGBColorSpace,

    generateMipmaps: true,

    minFilter: THREE.LinearMipmapLinearFilter,

  });

  const cubeCam = new THREE.CubeCamera(0.08, 48, cubeRT);


  const eqRT = new THREE.WebGLRenderTarget(EQ_W, EQ_H, {

    type: THREE.UnsignedByteType,

    colorSpace: THREE.SRGBColorSpace,

    generateMipmaps: true,

    minFilter: THREE.LinearMipmapLinearFilter,

  });

  eqRT.texture.colorSpace = THREE.SRGBColorSpace;


  const blitCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const blitMat = new THREE.ShaderMaterial({

    uniforms: { tCube: { value: cubeRT.texture } },

    vertexShader: /* glsl */ `

      varying vec2 vUv;

      void main() {

        vUv = uv;

        gl_Position = vec4(position.xy, 0.0, 1.0);

      }

    `,

    fragmentShader: /* glsl */ `

      uniform samplerCube tCube;

      varying vec2 vUv;

      const float PI = 3.141592653589793;

      void main() {

        float lon = (vUv.x - 0.5) * 2.0 * PI;

        float lat = (vUv.y - 0.5) * PI;

        vec3 dir = vec3(

          cos(lat) * cos(lon),

          sin(lat),

          cos(lat) * sin(lon)

        );

        gl_FragColor = textureCube(tCube, dir);

      }

    `,

    depthTest: false,

    depthWrite: false,

    toneMapped: false,

  });

  const blitMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), blitMat);

  const blitScene = new THREE.Scene();

  blitScene.add(blitMesh);


  const sphereGeo = new THREE.SphereGeometry(500, 64, 48);

  sphereGeo.scale(-1, 1, 1);

  const sphereMat = new THREE.MeshBasicMaterial({

    map: eqRT.texture,

    toneMapped: false,

  });

  const sphere = new THREE.Mesh(sphereGeo, sphereMat);

  const panoScene = new THREE.Scene();

  panoScene.background = new THREE.Color("#111111");

  panoScene.add(sphere);


  function capture(world: THREE.Scene, x: number, y: number, z: number, hide: THREE.Object3D[]) {

    const vis: boolean[] = hide.map((o) => o.visible);

    for (const o of hide) o.visible = false;

    cubeCam.position.set(x, y, z);

    cubeCam.update(renderer, world);

    renderer.setRenderTarget(eqRT);

    renderer.render(blitScene, blitCam);

    renderer.setRenderTarget(null);

    eqRT.texture.needsUpdate = true;

    hide.forEach((o, i) => {

      o.visible = vis[i] ?? false;

    });

  }


  function dispose() {

    cubeCam.removeFromParent();

    cubeRT.dispose();

    eqRT.dispose();

    blitMat.dispose();

    blitMesh.geometry.dispose();

    sphereGeo.dispose();

    sphereMat.dispose();

  }


  return { cubeCam, panoScene, capture, dispose, texture: eqRT.texture };

}
