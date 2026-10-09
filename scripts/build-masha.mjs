// Builds public/models/masha-web.glb from the app's masha_lite.glb.
//
//   npm run masha -- <path to masha_lite.glb>
//
// The source GLB is NOT kept in this repository. What the web copy keeps and drops:
//   - keeps the body, head, eyes and hair meshes (generated with MPFB2 from the CC0
//     MakeHuman assets) and their skeleton, so the site can pose and animate them in code;
//   - drops every animation clip: some of the app's clips are retargeted Mixamo motion,
//     which is not ours to republish as a downloadable file;
//   - drops the holotank (the site draws its own rings), textures, UVs and tangents
//     (the hologram shader only needs positions and normals);
//   - keeps only the blink morph targets, then welds, quantizes and meshopt-compresses.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, quantize, weld, meshopt } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
import { statSync } from 'node:fs';
import { resolve } from 'node:path';

const src = process.argv[2];
if (!src) {
  console.error('Usage: npm run masha -- <path to masha_lite.glb>');
  process.exit(1);
}
const out = resolve('public/models/masha-web.glb');
const KEEP_MESHES = new Set(['Masha_Body', 'Masha_Head', 'Masha_Eyes', 'Masha_Hair']);
const KEEP_MORPHS = [/blink/i, /mouthSmile/i];

await MeshoptEncoder.ready;
await MeshoptDecoder.ready;
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });
const doc = await io.read(src);
const root = doc.getRoot();

for (const anim of root.listAnimations()) anim.dispose();

for (const node of root.listNodes()) {
  const mesh = node.getMesh();
  if (!mesh) continue;
  const base = mesh.getName().replace(/\.\d+$/, '');
  if (!KEEP_MESHES.has(base)) {
    node.setMesh(null);
    continue;
  }
  const targetNames = mesh.getExtras()?.targetNames ?? [];
  const keep = targetNames.map((n) => KEEP_MORPHS.some((r) => r.test(n)));
  for (const prim of mesh.listPrimitives()) {
    for (const sem of ['TANGENT', 'TEXCOORD_0', 'TEXCOORD_1']) {
      const a = prim.getAttribute(sem);
      if (a) prim.setAttribute(sem, null);
    }
    prim.listTargets().forEach((t, i) => {
      if (!keep[i]) {
        prim.removeTarget(t);
        t.dispose();
      }
    });
  }
  if (targetNames.length) {
    const names = targetNames.filter((_, i) => keep[i]);
    mesh.setExtras({ ...mesh.getExtras(), targetNames: names });
    mesh.setWeights(names.map(() => 0));
  }
}
for (const tex of root.listTextures()) tex.dispose();

await doc.transform(
  prune({ keepLeaves: false }),
  dedup(),
  weld(),
  quantize({ quantizePosition: 14, quantizeNormal: 8 }),
  meshopt({ encoder: MeshoptEncoder, level: 'high' }),
);
await io.write(out, doc);
console.log(`masha-web.glb: ${(statSync(out).size / 1024).toFixed(0)} KB`);
