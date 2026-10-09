// Masha as a hologram, with three.js (lazy chunk). The model is public/models/masha-web.glb
// (scripts/build-masha.mjs): CC0 MakeHuman geometry and its skeleton, no animation clips. Every
// motion here is procedural: arms brought down from the bind pose, breathing, a slow sway, blinking,
// a head that follows the pointer, rings and rising motes. Colors from the app's holo room
// (BrandTokens.HOLO_LINE #5CE1FF on HOLO_BG).
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  FrontSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  RingGeometry,
  Scene,
  SRGBColorSpace,
  Timer,
  WebGLRenderer,
  type Bone,
  type Material,
  type Object3D,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

const HOLO = new Color('#5ce1ff');
const HOLO_DEEP = new Color('#1b6dff');

interface Options {
  still: boolean;
  label: string;
}

function holoMaterial(strength: number, uniforms: { uTime: { value: number } }): Material {
  const m = new MeshStandardMaterial({ color: 0x000000, side: FrontSide });
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.uniforms.uHolo = { value: HOLO };
    shader.uniforms.uDeep = { value: HOLO_DEEP };
    shader.uniforms.uStrength = { value: strength };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float vHoloY;')
      .replace('#include <skinning_vertex>', '#include <skinning_vertex>\nvHoloY = (modelMatrix * vec4(transformed, 1.0)).y;');
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying float vHoloY;\nuniform float uTime;\nuniform vec3 uHolo;\nuniform vec3 uDeep;\nuniform float uStrength;',
      )
      .replace(
        '#include <dithering_fragment>',
        `#include <dithering_fragment>
        vec3 n = normalize(vNormal);
        vec3 v = normalize(vViewPosition);
        float fres = pow(1.0 - clamp(abs(dot(n, v)), 0.0, 1.0), 2.0);
        float scan = 0.55 + 0.45 * sin(vHoloY * 260.0 - uTime * 3.0);
        float band = smoothstep(0.0, 0.04, abs(fract(vHoloY * 0.6 - uTime * 0.12) - 0.5));
        vec3 col = mix(uDeep * 0.22, uHolo, fres) * (0.55 + 0.45 * scan);
        col += uHolo * (1.0 - band) * 0.25;
        gl_FragColor = vec4(col * uStrength, 1.0);`,
      );
  };
  return m;
}

export async function mountMasha(mount: HTMLElement, opts: Options) {
  const renderer = new WebGLRenderer({ antialias: (window.devicePixelRatio || 1) < 2, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', opts.label);

  const scene = new Scene();
  const camera = new PerspectiveCamera(28, 1, 0.1, 50);
  camera.position.set(0, 0.98, 4.4);
  camera.lookAt(0, 0.9, 0);

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync('/models/masha-web.glb');
  const model = gltf.scene;
  const uniforms = { uTime: { value: 0 } };
  const bones = new Map<string, Bone>();
  const blink: { mesh: Mesh; l: number; r: number }[] = [];

  model.traverse((o: Object3D) => {
    if ((o as Bone).isBone) bones.set(o.name.replace('mixamorig', '').replace(':', ''), o as Bone);
    const mesh = o as Mesh;
    if (!mesh.isMesh) return;
    const name = ((mesh.material as Material)?.name || '').toLowerCase();
    if (/mouthinterior|teeth|tongue|lashes|brows/.test(name)) {
      mesh.visible = false;
      return;
    }
    const strength = /eye/.test(name) ? 1.5 : /hair/.test(name) ? 0.6 : 1;
    mesh.material = holoMaterial(strength, uniforms);
    mesh.frustumCulled = false;
    const dict = mesh.morphTargetDictionary;
    if (dict && 'eyeBlinkLeft' in dict && 'eyeBlinkRight' in dict) blink.push({ mesh, l: dict.eyeBlinkLeft, r: dict.eyeBlinkRight });
  });
  const rig = new Group();
  rig.add(model);
  scene.add(rig);

  // Rest pose: bring the arms down from the bind pose (A-pose) to the sides.
  const lower = (side: 'Left' | 'Right') => {
    const s = side === 'Left' ? 1 : -1;
    const upper = bones.get(`${side}Arm`);
    if (!upper) return;
    upper.rotation.y += s * 0.6;
    upper.rotation.z += -s * 0.9;
  };
  lower('Left');
  lower('Right');
  const spine = bones.get('Spine1');
  const head = bones.get('Head');
  const neck = bones.get('Neck');
  const base = {
    spine: spine?.rotation.x ?? 0,
    headY: head?.rotation.y ?? 0,
    headX: head?.rotation.x ?? 0,
    neckY: neck?.rotation.y ?? 0,
  };

  // Floor rings and rising motes (own geometry).
  const ringMat = new MeshBasicMaterial({ color: HOLO, transparent: true, opacity: 0.55, blending: AdditiveBlending, depthWrite: false });
  const rings = new Group();
  [0.42, 0.62, 0.8].forEach((r, i) => {
    const ring = new Mesh(new RingGeometry(r - 0.006, r + 0.006, 96), ringMat.clone());
    (ring.material as MeshBasicMaterial).opacity = 0.6 - i * 0.16;
    ring.rotation.x = -Math.PI / 2;
    rings.add(ring);
  });
  rings.position.y = 0.005;
  scene.add(rings);
  const N = 140;
  const pos = new Float32Array(N * 3);
  const speed = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 0.15 + Math.random() * 0.7;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = Math.random() * 2;
    pos[i * 3 + 2] = Math.sin(a) * r;
    speed[i] = 0.05 + Math.random() * 0.18;
  }
  const motesGeo = new BufferGeometry();
  motesGeo.setAttribute('position', new BufferAttribute(pos, 3));
  const motes = new Points(
    motesGeo,
    new PointsMaterial({ color: HOLO, size: 0.012, transparent: true, opacity: 0.8, blending: AdditiveBlending, depthWrite: false }),
  );
  scene.add(motes);

  mount.append(canvas);
  const resize = () => {
    const w = mount.clientWidth || 1;
    const h = mount.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Keep the whole figure in frame on tall and wide stages.
    camera.fov = w / h < 0.8 ? 30 : 26;
    camera.updateProjectionMatrix();
  };
  resize();
  new ResizeObserver(resize).observe(mount);

  // Drag to turn her, with a little inertia.
  let yaw = -0.35;
  let vel = 0;
  let dragging = false;
  let lastX = 0;
  let lookX = 0;
  let lookY = 0;
  canvas.addEventListener('pointerdown', (e) => {
    dragging = true;
    lastX = e.clientX;
    canvas.setPointerCapture(e.pointerId);
    canvas.style.cursor = 'grabbing';
  });
  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    lookX = ((e.clientX - r.left) / r.width - 0.5) * 2;
    lookY = ((e.clientY - r.top) / r.height - 0.5) * 2;
    if (!dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    vel = dx * 0.008;
    yaw += vel;
    if (opts.still) frame();
  });
  const release = () => {
    dragging = false;
    canvas.style.cursor = '';
  };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);

  const timer = new Timer();
  let visible = true;
  let raf = 0;
  let nextBlink = 1.5;
  let blinkT = -1;

  function frame() {
    timer.update();
    const dt = Math.min(timer.getDelta(), 0.05);
    const t = timer.getElapsed();
    uniforms.uTime.value = opts.still ? 0 : t;
    if (!opts.still) {
      if (!dragging) {
        vel *= 0.94;
        yaw += vel + 0.0025 * Math.sin(t * 0.3);
      }
      if (spine) spine.rotation.x = base.spine + Math.sin(t * 1.6) * 0.012;
      model.position.y = Math.sin(t * 0.9) * 0.01;
      if (head) {
        head.rotation.y += (base.headY + lookX * 0.35 - head.rotation.y) * 0.06;
        head.rotation.x += (base.headX + lookY * 0.18 - head.rotation.x) * 0.06;
      }
      // Blink every few seconds.
      if (t > nextBlink && blinkT < 0) blinkT = 0;
      if (blinkT >= 0) {
        blinkT += dt;
        const k = blinkT < 0.08 ? blinkT / 0.08 : Math.max(0, 1 - (blinkT - 0.08) / 0.12);
        for (const b of blink) {
          b.mesh.morphTargetInfluences![b.l] = k;
          b.mesh.morphTargetInfluences![b.r] = k;
        }
        if (blinkT > 0.2) {
          blinkT = -1;
          nextBlink = t + 2.5 + Math.random() * 3.5;
        }
      }
      rings.children.forEach((r, i) => (r.rotation.z = t * (0.2 + i * 0.12) * (i % 2 ? -1 : 1)));
      const p = motesGeo.attributes.position as BufferAttribute;
      for (let i = 0; i < N; i++) {
        let y = p.getY(i) + speed[i] * dt;
        if (y > 2.1) y = 0;
        p.setY(i, y);
      }
      p.needsUpdate = true;
    }
    rig.rotation.y = yaw;
    renderer.render(scene, camera);
  }

  const loop = () => {
    raf = 0;
    if (!visible || document.hidden) return;
    frame();
    raf = requestAnimationFrame(loop);
  };
  const kick = () => {
    if (opts.still) frame();
    else if (!raf) raf = requestAnimationFrame(loop);
  };
  new IntersectionObserver((e) => {
    visible = e[0].isIntersecting;
    kick();
  }).observe(mount);
  document.addEventListener('visibilitychange', kick);
  frame();
  kick();
}
