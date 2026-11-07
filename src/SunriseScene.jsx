import { useEffect, useRef, useState } from 'react';

const bands = 16;
const vertex = `
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec2 vUv;
  void main() {
    vec4 p = modelViewMatrix * vec4(position, 1.);
    vNormal = normalize(normalMatrix * normal);
    vView = -p.xyz;
    vUv = uv;
    gl_Position = projectionMatrix * p;
  }
`;
const fragment = `
  uniform float uPhase;
  uniform float uTime;
  uniform float uIndex;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec2 vUv;
  void main() {
    vec3 normal = normalize(vNormal) * (gl_FrontFacing ? 1. : -1.);
    vec3 view = normalize(vView);
    float fresnel = pow(clamp(1. - abs(dot(normal, view)), 0., 1.), 2.8);
    float angle = vUv.x * 6.28318;
    float wave = .5 + .5 * cos(angle * 2. - uTime * 1.15 + uIndex * .21);
    float sweep = pow(.5 + .5 * cos(angle - uTime * 1.46 + uIndex * .18), 9.);
    float edge = pow(abs(vUv.y * 2. - 1.), 11.);
    float gloss = pow(max(0., dot(normal, normalize(vec3(-.4, .8, 1.)))), 11.);
    vec3 metal = mix(vec3(.09,.007,.008), vec3(.42,.028,.013), wave);
    metal += vec3(.19,.022,.009) * fresnel;
    vec3 light = vec3(1.,.21,.064) * (.27 + sweep * .73) + vec3(.55,.24,.12) * gloss;
    vec3 color = metal + light * (edge * .82 + sweep * .23 + fresnel * .28);
    color *= mix(.65, 1., uPhase);
    gl_FragColor = vec4(color, 1.);
  }
`;

function createBand(THREE, index) {
  const segments = 128;
  const strips = 8;
  const radius = 1.62 + index * .116;
  const width = .104 + index * .003;
  const positions = [];
  const uv = [];
  const faces = [];
  for (let step = 0; step <= segments; step += 1) {
    const progress = step / segments;
    const angle = progress * Math.PI * 2;
    const warp = .07 * Math.cos(angle * 3 + index * .15);
    for (let strip = 0; strip <= strips; strip += 1) {
      const fraction = strip / strips;
      const offset = fraction - .5;
      const r = radius + offset * width + warp;
      const bevel = Math.sin(fraction * Math.PI) * width * .49;
      positions.push(r * Math.cos(angle), r * Math.sin(angle), bevel + .25 * Math.sin(angle * 2 + index * .14));
      uv.push(progress, fraction);
      if (step < segments && strip < strips) {
        const a = step * (strips + 1) + strip;
        const b = a + strips + 1;
        faces.push(a, a + 1, b, a + 1, b + 1, b);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex(faces);
  geometry.computeVertexNormals();
  const material = new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    side: THREE.DoubleSide,
    uniforms: { uPhase: { value: 1 }, uTime: { value: 0 }, uIndex: { value: index } },
  });
  return new THREE.Mesh(geometry, material);
}

function Fallback() {
  return <div className="scene-fallback">
    <svg viewBox="0 0 680 680" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="portal-metal" x1="0" y1="1" x2="1" y2="0">
          <stop stopColor="#3b100e"/><stop offset=".26" stopColor="#fe6c37"/>
          <stop offset=".51" stopColor="#710d0a"/><stop offset=".8" stopColor="#c42c1a"/><stop offset="1" stopColor="#ffab68"/>
        </linearGradient>
      </defs>
      <g className="fallback-portal">
        {Array.from({ length: bands }, (_, i) => <ellipse key={i} cx="340" cy="340" rx={157 + i * 10} ry={140 + i * 9} transform={`rotate(${i * 6 - 40} 340 340)`} fill="none" stroke="url(#portal-metal)" strokeWidth={5 + i * .19} />)}
      </g>
    </svg>
  </div>;
}

export default function SunriseScene({ paused }) {
  const host = useRef(null);
  const pause = useRef(paused);
  const requestFrame = useRef(() => {});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    pause.current = paused;
    requestFrame.current();
  }, [paused]);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    async function start() {
      const THREE = await import('three');
      const element = host.current;
      if (disposed || !element) return;
      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
      } catch {
        return;
      }

      const canvas = renderer.domElement;
      canvas.setAttribute('aria-hidden', 'true');
      element.appendChild(canvas);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, .1, 40);
      const portal = new THREE.Group();
      const rings = Array.from({ length: bands }, (_, index) => createBand(THREE, index));
      portal.add(...rings);
      scene.add(portal);

      let frame = 0;
      let previous = 0;
      let time = 0;
      let visible = true;
      let lost = false;
      let first = true;
      let pointerX = 0;
      let pointerY = 0;
      let driftX = 0;
      let driftY = 0;
      let progress = 0;

      function schedule() {
        if (!frame && !document.hidden && visible && !lost && !disposed) frame = requestAnimationFrame(render);
      }

      function render(now) {
        frame = 0;
        if (!visible || lost || document.hidden) {
          previous = 0;
          return;
        }
        if (!pause.current && previous) time += Math.min((now - previous) / 1000, .18);
        previous = pause.current ? 0 : now;
        const t = pause.current && time === 0 ? 3.2 : time;
        if (!pause.current) {
          driftX += (pointerX - driftX) * .065;
          driftY += (pointerY - driftY) * .065;
        }
        const tilt = Math.sin(t * .55);
        portal.rotation.set(.13 + tilt * .14 + driftY * .23, -.15 + Math.sin(t * .69) * .25 + driftX * .4, -.15 + t * .14);
        portal.position.z = progress * 2;
        rings.forEach((ring, index) => {
          const delay = index * .055;
          const linear = Math.min(1, Math.max(0, (t - delay) / 1.8));
          const entrance = 1 - (1 - linear) ** 3;
          const wave = Math.sin(t * 1.12 - index * .42);
          ring.rotation.x = (1 - entrance) * 1.6 + wave * .22;
          ring.rotation.y = (1 - entrance) * -.95 + Math.sin(t * .92 + index * .45) * .19;
          ring.position.z = (index - bands / 2) * .058 + wave * .18 + (1 - entrance) * -2.8;
          ring.scale.setScalar(.37 + entrance * .63);
          ring.material.uniforms.uTime.value = t;
          ring.material.uniforms.uPhase.value = entrance;
        });
        renderer.render(scene, camera);
        if (first) {
          first = false;
          setReady(true);
        }
        if (!pause.current) schedule();
      }

      function resize() {
        const { clientWidth: width, clientHeight: height } = element;
        if (!width || !height || lost) return;
        // Keep the animated scene sharp without rendering millions of extra pixels on high-DPI displays.
        const ratio = Math.min(window.devicePixelRatio, 1.5, Math.sqrt(1_250_000 / (width * height)));
        renderer.setPixelRatio(ratio);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.position.z = Math.max(10.8, 9.9 / camera.aspect);
        camera.updateProjectionMatrix();
        schedule();
      }

      const onPointer = event => {
        pointerX = event.clientX / window.innerWidth - .5;
        pointerY = event.clientY / window.innerHeight - .5;
      };
      const onScroll = () => { progress = Math.min(1, window.scrollY / element.clientHeight); };
      const onVisibility = () => { previous = 0; schedule(); };
      const onLoss = () => {
        lost = true;
        cancelAnimationFrame(frame);
        setReady(false);
      };
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(element);
      const intersection = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (!visible) previous = 0;
        schedule();
      });
      intersection.observe(element);
      requestFrame.current = schedule;
      window.addEventListener('pointermove', onPointer, { passive: true });
      window.addEventListener('scroll', onScroll, { passive: true });
      document.addEventListener('visibilitychange', onVisibility);
      canvas.addEventListener('webglcontextlost', onLoss);
      resize();

      cleanup = () => {
        cancelAnimationFrame(frame);
        requestFrame.current = () => {};
        resizeObserver.disconnect();
        intersection.disconnect();
        window.removeEventListener('pointermove', onPointer);
        window.removeEventListener('scroll', onScroll);
        document.removeEventListener('visibilitychange', onVisibility);
        canvas.removeEventListener('webglcontextlost', onLoss);
        rings.forEach(ring => {
          ring.geometry.dispose();
          ring.material.dispose();
        });
        renderer.dispose();
        canvas.remove();
      };
    }
    start().catch(error => {
      cleanup();
      console.warn('Sunrise portal unavailable; using the vector version.', error);
    });
    return () => { disposed = true; cleanup(); };
  }, []);

  return <div className={`sunrise-scene ${ready ? 'is-ready' : ''}`} ref={host} aria-hidden="true"><Fallback/></div>;
}
