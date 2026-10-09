// Masha as a hologram, with three.js (lazy chunk). The model is public/models/masha-web.glb
// (scripts/build-masha.mjs): CC0 MakeHuman geometry and its skeleton, no animation clips. Every
// motion here is procedural: a relaxed contrapposto posed from the bind pose (pose()), breathing, a slow sway, blinking,
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
  Quaternion,
  RingGeometry,
  Scene,
  SRGBColorSpace,
  Timer,
  Vector3,
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
        vec3 col = mix(uDeep * 0.38, uHolo * 1.15, fres) * (0.72 + 0.28 * scan);
        col += uHolo * pow(fres, 4.0) * 0.6;
        col += uHolo * (1.0 - band) * 0.2;
        gl_FragColor = vec4(col * uStrength, 1.0);`,
      );
  };
  return m;
}

const _a = new Vector3();
const _b = new Vector3();
const _q = new Quaternion();
const _w = new Quaternion();
const _p = new Quaternion();

/** Gives a bone the world rotation `world` (its parent's rotation is factored out). */
function setWorldRotation(bone: Object3D, world: Quaternion) {
  bone.parent!.getWorldQuaternion(_p);
  bone.quaternion.copy(_p.invert().multiply(world));
  bone.updateMatrixWorld(true);
}

/** Turns a bone (shortest arc) so that its child sits along `dir`, in model space (+Z = her front). */
function aim(bone: Object3D | undefined, child: Object3D | undefined, dir: Vector3) {
  if (!bone || !child) return;
  bone.getWorldPosition(_a);
  child.getWorldPosition(_b);
  _q.setFromUnitVectors(_b.sub(_a).normalize(), dir.clone().normalize());
  setWorldRotation(bone, _q.multiply(bone.getWorldQuaternion(_w)));
}

/** Rotates a bone in world space about `axis` by `angle` (whole sub-tree follows). */
function turn(bone: Object3D | undefined, axis: Vector3, angle: number) {
  if (!bone) return;
  _q.setFromAxisAngle(axis, angle);
  setWorldRotation(bone, _q.multiply(bone.getWorldQuaternion(_w)));
}

const v = (x: number, y: number, z: number) => new Vector3(x, y, z);
const X = v(1, 0, 0);
const Y = v(0, 1, 0);
const Z = v(0, 0, 1);

/**
 * Relaxed contrapposto from the bind A-pose: weight on her right leg, the left knee eased forward,
 * hips and shoulders tilted against each other, soft elbows, palms toward the thighs, head tipped.
 * Directions are in model space: +X her left, +Y up, +Z toward the viewer.
 */
function pose(model: Object3D, bones: Map<string, Bone>) {
  const b = (n: string) => bones.get(n);
  model.updateMatrixWorld(true);
  // Feet keep their bind orientation so they stay flat on the floor.
  const feet = (['Left', 'Right'] as const).map((s) => {
    const f = b(`${s}Foot`);
    return { f, q: f ? f.getWorldQuaternion(new Quaternion()) : null };
  });
  const supportFoot = b('RightFoot');
  const groundY = supportFoot ? supportFoot.getWorldPosition(new Vector3()).y : 0;

  // Pelvis: left hip drops, a quarter turn of attitude toward her support side.
  turn(b('Hips'), Z, 0.09);
  turn(b('Hips'), Y, -0.12);
  // Torso answers back so the shoulders tilt the other way.
  turn(b('Spine'), Z, -0.07);
  turn(b('Spine1'), Z, -0.05);
  turn(b('Spine2'), X, -0.05);
  turn(b('Neck'), X, 0.06);

  // Legs: right straight under the body, left relaxed with the knee forward and the foot turned out.
  aim(b('RightUpLeg'), b('RightLeg'), v(0.03, -1, 0.01));
  aim(b('RightLeg'), b('RightFoot'), v(0.02, -1, -0.02));
  aim(b('LeftUpLeg'), b('LeftLeg'), v(0.01, -1, 0.3));
  aim(b('LeftLeg'), b('LeftFoot'), v(0.1, -1, -0.12));
  for (const { f, q } of feet) if (f && q) setWorldRotation(f, q);
  turn(b('LeftFoot'), Y, 0.35);

  // Shoulders settle down a little, arms hang with soft elbows and the hands drawn in.
  turn(b('LeftShoulder'), Z, -0.08);
  turn(b('RightShoulder'), Z, 0.08);
  for (const [s, k] of [['Left', 1], ['Right', -1]] as const) {
    aim(b(`${s}Arm`), b(`${s}ForeArm`), v(k * 0.3, -1, -0.06));
    aim(b(`${s}ForeArm`), b(`${s}Hand`), v(k * 0.06, -1, 0.5));
    aim(b(`${s}Hand`), b(`${s}HandMiddle1`), v(-k * 0.08, -1, 0.3));
    // Fingers curl softly toward the thigh, a little more from index to pinky.
    (['Index', 'Middle', 'Ring', 'Pinky'] as const).forEach((f, i) => {
      for (let j = 1; j <= 3; j++) turn(b(`${s}Hand${f}${j}`), Z, -k * (0.16 + i * 0.05));
    });
    turn(b(`${s}HandThumb1`), Z, -k * 0.1);
  }
  // Head: a slight tilt and turn, chin level.
  turn(b('Neck'), Z, 0.05);
  turn(b('Head'), Z, 0.06);
  turn(b('Head'), Y, 0.1);

  // Put the support foot back on the floor.
  if (supportFoot) model.position.y += groundY - supportFoot.getWorldPosition(new Vector3()).y;
  model.updateMatrixWorld(true);
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

  pose(model, bones);
  const spine = bones.get('Spine1');
  const head = bones.get('Head');
  const neck = bones.get('Neck');
  const base = {
    spine: spine?.rotation.x ?? 0,
    headY: head?.rotation.y ?? 0,
    headX: head?.rotation.x ?? 0,
    neckY: neck?.rotation.y ?? 0,
    y: model.position.y,
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
      model.position.y = base.y + Math.sin(t * 0.9) * 0.01;
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
