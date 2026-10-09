// Encodes the device recordings in assets-src/video/*.mp4 (adb screenrecord, not in git) into short,
// silent loops for the web: public/video/<name>.webm (VP9) + <name>.mp4 (H.264) + <name>.jpg poster.
//
//   npm run video            (needs ffmpeg on PATH, or FFMPEG=C:\path\to\ffmpeg.exe)
//
// The site picks a video up automatically at build time when public/video/<name>.webm exists:
//   wheel → the Meridian feature art, masha → Masha's stage when 3D is unavailable.
// assets-src/video/intro.mp4 is kept for later but not encoded (no page uses it). To bring it back,
// add: intro: { start: 1.0, duration: 3.4, poster: 4.0 } (ends before the cross-fade into Settings).
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync } from 'node:fs';

const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const CAP_KB = 2600;
// Trim points (seconds) chosen from the recordings made on 2026-10-08.
const CLIPS = {
  wheel: { start: 1.2, duration: 7.0 },
  masha: { start: 0.0, duration: 7.5 },
};

const probe = spawnSync(FFMPEG, ['-hide_banner', '-version'], { encoding: 'utf8' });
if (probe.error || probe.status !== 0) {
  console.error('ffmpeg not found. Install it (winget install Gyan.FFmpeg) or set FFMPEG to its path.');
  process.exit(1);
}
mkdirSync('public/video', { recursive: true });

// ZUI system chrome in landscape (2560x1600): the caption bar takes the top 70 px and the side-panel
// handle the right-most 24 px. Crop both, then scale to 1280 wide.
const VF = 'crop=iw-iw*24/2560:ih-ih*70/1600:0:ih*70/1600,scale=1280:-2:flags=lanczos,fps=30';
const run = (args) => {
  const r = spawnSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
  if (r.status !== 0) throw new Error(`ffmpeg failed: ${args.join(' ')}`);
};

let bad = 0;
for (const [name, { start, duration, poster }] of Object.entries(CLIPS)) {
  const src = `assets-src/video/${name}.mp4`;
  if (!existsSync(src)) {
    console.warn(`skip ${name}: ${src} not found`);
    continue;
  }
  const cut = ['-ss', String(start), '-t', String(duration), '-i', src, '-an', '-dn', '-sn', '-map_metadata', '-1', '-vf', VF];
  run([...cut, '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '38', '-row-mt', '1', '-deadline', 'good', `public/video/${name}.webm`]);
  run([...cut, '-c:v', 'libx264', '-crf', '27', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', `public/video/${name}.mp4`]);
  run(['-ss', String(poster ?? start + duration / 2), '-i', src, '-frames:v', '1', '-vf', VF, '-q:v', '4', `public/video/${name}.jpg`]);
  for (const ext of ['webm', 'mp4', 'jpg']) {
    const f = `public/video/${name}.${ext}`;
    const kb = statSync(f).size / 1024;
    if (kb > CAP_KB) bad++;
    console.log(`${f.padEnd(28)} ${kb.toFixed(0).padStart(6)} KB${kb > CAP_KB ? '  <-- over cap' : ''}`);
  }
}
if (bad) process.exit(1);
