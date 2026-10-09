// Hero background: a small WebGL shader (no library). Aurora bands and drifting stardust in the
// signature palette. Renders at reduced resolution, pauses off-screen and in hidden tabs, draws a
// single still frame with reduced motion, and leaves the CSS gradient alone if WebGL is missing.
import { $, lowPower, reducedMotion } from './env';

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

const FRAG = `precision mediump float;
uniform vec2 r;uniform float t;uniform vec3 c1;uniform vec3 c2;uniform vec3 ck;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/r;vec2 q=uv;q.x*=r.x/r.y;
  float tt=t*.04;
  float w=fbm(vec2(q.x*1.2+tt,q.y*.8-tt*.6));
  float band1=smoothstep(.35,.0,abs(uv.y-.62-(w-.5)*.55));
  float band2=smoothstep(.28,.0,abs(uv.y-.36-(fbm(q*1.6-tt)-.5)*.5));
  vec3 col=c1*band1*.55+c2*band2*.32;
  col+=ck*pow(band1*band2,1.5)*.4;
  float glow=smoothstep(1.1,.0,length((uv-vec2(.72,.55))*vec2(1.4,1.)));
  col+=c1*glow*.18;
  vec2 g=q*vec2(46.,46.)+vec2(0.,-t*.35);
  vec2 cell=floor(g);vec2 f=fract(g)-.5;float s=h(cell);
  float star=step(.965,s)*smoothstep(.09,.0,length(f+vec2(sin(t*.7+s*30.)*.18,0.)));
  star*=.5+.5*sin(t*1.7+s*60.);
  col+=mix(c2,ck,s)*star*.9;
  float vig=smoothstep(1.25,.25,length(uv-vec2(.55,.5)));
  col*=vig;
  gl_FragColor=vec4(col,1.);
}`;

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.trim().replace('#', '');
  const v = parseInt(m.length === 3 ? m.replace(/./g, (c) => c + c) : m, 16);
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
}

export function initAurora() {
  const canvas = $<HTMLCanvasElement>('[data-aurora]');
  if (!canvas) return;
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power', premultipliedAlpha: false });
  if (!gl) return;
  // Software rasterizers (no GPU) would run the shader on the CPU: keep the CSS gradient instead.
  const dbg = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = String(dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
  if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer)) {
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return;
  }

  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    return sh;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  // Asking for the link status blocks until the driver has compiled the shader; with
  // KHR_parallel_shader_compile we poll instead, so the main thread never waits on the GPU.
  const parallel = gl.getExtension('KHR_parallel_shader_compile') as { COMPLETION_STATUS_KHR: number } | null;
  const ready = () => {
    if (parallel && !gl.getProgramParameter(prog, parallel.COMPLETION_STATUS_KHR)) {
      setTimeout(ready, 50);
      return;
    }
    if (gl.getProgramParameter(prog, gl.LINK_STATUS)) start();
  };
  const start = () => {
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uR = gl.getUniformLocation(prog, 'r');
  const uT = gl.getUniformLocation(prog, 't');
  const u1 = gl.getUniformLocation(prog, 'c1');
  const u2 = gl.getUniformLocation(prog, 'c2');
  const uk = gl.getUniformLocation(prog, 'ck');

  const still = reducedMotion();
  const light = lowPower();
  // Rendering below device resolution: the image is soft by design.
  const scale = light ? 0.35 : Math.min(window.devicePixelRatio || 1, 2) * 0.5;
  const frameMs = light ? 1000 / 30 : 0;

  let cur = { a: [0, 0, 0], b: [0, 0, 0], k: [0, 0, 0] };
  let target = cur;
  const readPalette = () => {
    const cs = getComputedStyle(document.documentElement);
    target = {
      a: hexToRgb(cs.getPropertyValue('--p1')),
      b: hexToRgb(cs.getPropertyValue('--p2')),
      k: hexToRgb(cs.getPropertyValue('--spark')),
    };
  };
  readPalette();
  cur = { a: [...target.a], b: [...target.b], k: [...target.k] };

  const resize = () => {
    const w = Math.max(1, Math.round(canvas.clientWidth * scale));
    const h = Math.max(1, Math.round(canvas.clientHeight * scale));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  };

  let visible = true;
  let raf = 0;
  let last = 0;
  const t0 = performance.now() - 20000;
  const draw = (now: number) => {
    raf = 0;
    if (frameMs && now - last < frameMs) {
      schedule();
      return;
    }
    last = now;
    resize();
    const k = 0.06;
    (['a', 'b', 'k'] as const).forEach((key) => {
      for (let i = 0; i < 3; i++) cur[key][i] += (target[key][i] - cur[key][i]) * k;
    });
    gl.uniform2f(uR, canvas.width, canvas.height);
    gl.uniform1f(uT, (still ? 20000 : now - t0) / 1000);
    gl.uniform3fv(u1, cur.a);
    gl.uniform3fv(u2, cur.b);
    gl.uniform3fv(uk, cur.k);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!still) schedule();
  };
  const schedule = () => {
    if (!raf && visible && !document.hidden) raf = requestAnimationFrame(draw);
  };

  new IntersectionObserver((e) => {
    visible = e[0].isIntersecting;
    schedule();
  }).observe(canvas);
  document.addEventListener('visibilitychange', schedule);
  document.addEventListener('palettechange', () => {
    readPalette();
    if (still) {
      cur = { a: [...target.a], b: [...target.b], k: [...target.k] };
      schedule();
    } else schedule();
  });
  window.addEventListener('resize', () => (still ? schedule() : undefined), { passive: true });

  schedule();
  requestAnimationFrame(() => canvas.classList.add('is-on'));
  };
  ready();
}
