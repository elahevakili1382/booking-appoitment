<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    colorTop?: string
    colorMid?: string
    colorBottom?: string
    colorAccent?: string
    speed?: number
    scale?: number
  }>(),
  {
    colorTop: '#faedcd',
    colorMid: '#fefae0',
    colorBottom: '#e9edc9',
    colorAccent: '#d4a373', // رنگ لکه‌ها؛ از پالت خودت (دکمه‌ی رزرو)
    speed: 0.5,
    scale: 0.5,
  },
)

const canvas = ref<HTMLCanvasElement | null>(null)
let raf = 0
let io: IntersectionObserver | null = null
let ro: ResizeObserver | null = null
let visible = true

const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

const VERT = `
attribute vec2 a_pos;
void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }
`

const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec3 u_top;
uniform vec3 u_mid;
uniform vec3 u_bot;
uniform vec3 u_acc;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for(int i = 0; i < 5; i++){ v += a * noise(p); p *= 2.0; a *= 0.5; }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  uv.y = 1.0 - uv.y;
  float asp = u_res.x / u_res.y;
  vec2 p = vec2(uv.x * asp, uv.y) * 1.1;   // عدد کمتر = ابرهای درشت‌تر
  float t = u_time * 0.35;

  // اعوجاج دوبل (domain warping) برای شکل ابری و روان
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(p + 3.0 * q + vec2(1.7, 9.2) + t * 0.6),
                fbm(p + 3.0 * q + vec2(8.3, 2.8) - t * 0.5));
  float f = fbm(p + 3.0 * r);

  // پایه: گرادیان عمودی
  float g = clamp(uv.y + (f - 0.5) * 0.5, 0.0, 1.0);
  vec3 col = g < 0.5
    ? mix(u_top, u_mid, smoothstep(0.0, 0.5, g))
    : mix(u_mid, u_bot, smoothstep(0.5, 1.0, g));

  // لکه‌های رنگی نرم و متحرک
    float blob1 = smoothstep(0.35, 0.80, f);
  float blob2 = smoothstep(0.30, 0.75, length(r));
  col = mix(col, u_acc, blob1 * 0.7);
  col = mix(col, u_top, blob2 * 0.6);

  // روشنایی نرم برای حس «هوا»
  col += (f - 0.5) * 0.06;

  // دانه‌ی ریز (grain) مثل پگاسوس
  float grain = hash(gl_FragCoord.xy + fract(u_time)) - 0.5;
  col += grain * 0.025;

  gl_FragColor = vec4(col, 1.0);
}
`

onMounted(() => {
  const el = canvas.value
  if (!el) return
  const gl = el.getContext('webgl', { antialias: false, alpha: false })
  if (!gl) return

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!
    gl.shaderSource(s, src)
    gl.compileShader(s)
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error('Shader error:', gl.getShaderInfoLog(s))
    }
    return s
  }
  const prog = gl.createProgram()!
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT))
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG))
  gl.linkProgram(prog)
  gl.useProgram(prog)

  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, 'a_pos')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

  const uRes = gl.getUniformLocation(prog, 'u_res')
  const uTime = gl.getUniformLocation(prog, 'u_time')
  gl.uniform3fv(gl.getUniformLocation(prog, 'u_top'), hexToRgb(props.colorTop))
  gl.uniform3fv(gl.getUniformLocation(prog, 'u_mid'), hexToRgb(props.colorMid))
  gl.uniform3fv(gl.getUniformLocation(prog, 'u_bot'), hexToRgb(props.colorBottom))
  gl.uniform3fv(gl.getUniformLocation(prog, 'u_acc'), hexToRgb(props.colorAccent))

  const resize = () => {
    const r = el.getBoundingClientRect()
    el.width = Math.max(1, Math.floor(r.width * props.scale))
    el.height = Math.max(1, Math.floor(r.height * props.scale))
    gl.viewport(0, 0, el.width, el.height)
    gl.uniform2f(uRes, el.width, el.height)
  }
  resize()
  ro = new ResizeObserver(resize)
  ro.observe(el)

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const start = performance.now()

  const draw = () => {
    gl.uniform1f(uTime, ((performance.now() - start) / 1000) * props.speed * 4)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  const loop = () => {
    if (visible) draw()
    raf = requestAnimationFrame(loop)
  }

  if (reduce) {
    draw()
  } else {
    loop()
    io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(el)
  }
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  io?.disconnect()
  ro?.disconnect()
})
</script>

<template>
  <canvas ref="canvas" aria-hidden="true" class="pointer-events-none absolute inset-0 -z-10 h-full w-full" />
</template>