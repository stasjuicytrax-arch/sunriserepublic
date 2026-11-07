import { useEffect, useRef, useState } from 'react';

const vertex = `
varying vec3 vPosition;
varying vec2 vUv;
void main() {
  vPosition = position; vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
const fragment = `
uniform float uTime;
uniform float uReflection;
varying vec3 vPosition;
varying vec2 vUv;
void main() {
  vec2 p = vPosition.xy;
  float height = sqrt(max(0.0, 9.0-p.x*p.x));
  float rib = pow(0.5+0.5*sin(p.x*89.0), 14.0);
  float thin = pow(0.5+0.5*sin(p.x*89.0+0.55), 55.0);
  float wave = sin(p.x*1.7 + p.y*1.1 - uTime*0.55)*0.5+0.5;
  float lightFront = -4.0 + 8.0 * fract((uTime + 2.0) / 14.0);
  float lightDistance = (p.x - lightFront + p.y*.46)*1.45;
  float sweep = exp(-lightDistance*lightDistance);
  float glow = exp(-p.y*1.55);
  float flare = exp(-abs(p.y-(0.45+sin(p.x*1.65+uTime*0.23)*0.32))*5.0);
  float top = exp(-abs(p.y-height)*25.0);
  vec3 red = vec3(.48,.008,.001);
  vec3 amber = vec3(1.0,.20,.025);
  vec3 col = red*(.13+rib*.95+wave*.08);
  col += red*flare*(rib*.9+.13);
  col += amber*(glow*(.18+rib*1.1)+top*.8+thin*wave*.14);
  col += vec3(.9,.54,.21)*thin*pow(wave,8.0)*.2;
  col += vec3(1.25,.23,.038)*sweep*(rib*.87+.12);
  float alpha = 1.0;
  if(uReflection > .5) {
    col *= .42*exp(-p.y*1.25);
    alpha = .72*exp(-p.y*1.3);
  }
  gl_FragColor = vec4(col,alpha);
}`;

export default function SunriseScene({ paused }) {
  const host = useRef(null);
  const pausedRef = useRef(paused);
  const restart = useRef(() => {});
  const [ready, setReady] = useState(false);
  useEffect(() => { pausedRef.current = paused; restart.current(); }, [paused]);
  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    async function init() {
      const THREE = await import('three');
      const [{ EffectComposer }, { RenderPass }, { UnrealBloomPass }, { OutputPass }] = await Promise.all([
        import('three/addons/postprocessing/EffectComposer.js'),
        import('three/addons/postprocessing/RenderPass.js'),
        import('three/addons/postprocessing/UnrealBloomPass.js'),
        import('three/addons/postprocessing/OutputPass.js'),
      ]);
      if (disposed || !host.current) return;
      const element = host.current;
      let renderer;
      try { renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' }); }
      catch { return; }
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1 : 1.35));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.18;
      const canvas = renderer.domElement;
      canvas.setAttribute('aria-hidden', 'true');
      element.appendChild(canvas);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1, .1, 80);
      const composer = new EffectComposer(renderer);
      const renderPass = new RenderPass(scene, camera);
      const bloom = new UnrealBloomPass(new THREE.Vector2(800, 600), .55, .45, .72);
      const output = new OutputPass();
      composer.addPass(renderPass); composer.addPass(bloom); composer.addPass(output);

      const group = new THREE.Group();
      group.position.set(1.65,-1.35,0);
      scene.add(group);

      const halo = new THREE.Mesh(new THREE.PlaneGeometry(13, 7), new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: `varying vec2 vUv;
          void main() {
            vec2 p = (vUv - vec2(.55,.43)) * vec2(2.0,3.4);
            float light = exp(-dot(p,p)*5.8) * smoothstep(0.,.17,vUv.y) * smoothstep(0.,.18,1.-vUv.y);
            light *= smoothstep(0.,.14,vUv.x) * smoothstep(0.,.14,1.-vUv.x);
            gl_FragColor = vec4(.58,.043,.006,light*.48);
          }`,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }));
      halo.position.set(.2, .95, -.8);
      group.add(halo);
      const shape = new THREE.Shape();
      shape.moveTo(3,0); shape.absarc(0,0,3,0,Math.PI,false); shape.lineTo(3,0);
      const geometry = new THREE.ShapeGeometry(shape, 120);
      const material = new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms: {uTime:{value:0},uReflection:{value:0}}, side: THREE.DoubleSide, transparent: true });
      const pane = new THREE.Mesh(geometry,material);
      group.add(pane);
      const backMaterial = new THREE.MeshStandardMaterial({color:0x1e0703,roughness:.26,metalness:.85});
      const body = new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.14,bevelEnabled:true,bevelSize:.035,bevelThickness:.035,bevelSegments:3,steps:1,curveSegments:100}), backMaterial);
      body.position.z=-.19; group.add(body);

      const curve = new THREE.EllipseCurve(0,0,3.015,3.015,0,Math.PI,false,0);
      const path = new THREE.CatmullRomCurve3(curve.getPoints(150).map(p=>new THREE.Vector3(p.x,p.y,.035)));
      const rim = new THREE.Mesh(new THREE.TubeGeometry(path,150,.012,8,false),new THREE.MeshBasicMaterial({color:new THREE.Color(3.5,1.2,.28)}));
      group.add(rim);
      const outerPath=new THREE.CatmullRomCurve3(curve.getPoints(150).map(p=>new THREE.Vector3(p.x*1.02,p.y*1.02,-.1)));
      const outerRim=new THREE.Mesh(new THREE.TubeGeometry(outerPath,150,.023,6,false),new THREE.MeshBasicMaterial({color:0x672210}));
      group.add(outerRim);
      const bottom = new THREE.Mesh(new THREE.BoxGeometry(6.02,.015,.14),new THREE.MeshBasicMaterial({color:new THREE.Color(2.5,.45,.07)}));
      bottom.position.z=.04; group.add(bottom);

      const reflectionMaterial = material.clone();
      reflectionMaterial.uniforms.uReflection.value=1;
      const reflection = new THREE.Mesh(geometry,reflectionMaterial);
      reflection.scale.y=-.68;
      reflection.position.y=-.025;
      group.add(reflection);

      // Real three-dimensional ceiling edges echo the supplied interior.
      const architecture=new THREE.Group();
      const lineMat=new THREE.MeshBasicMaterial({color:new THREE.Color(.8,.025,.002)});
      const lines=[
        [[-9,3,-4],[-1,2.1,-3],[7,4,-4]],
        [[-9,5,-3],[1.5,2.7,-3],[9,3.5,-4]],
        [[-7,1,-4],[-2,1.8,-3],[0,4,-4]],
        [[5,1.4,-4],[6,2.5,-3],[10,4.5,-4]],
      ];
      lines.forEach(points=>{
        const path=new THREE.CurvePath();
        points.slice(1).forEach((point,i)=>path.add(new THREE.LineCurve3(new THREE.Vector3(...points[i]),new THREE.Vector3(...point))));
        architecture.add(new THREE.Mesh(new THREE.TubeGeometry(path,20,.008,4,false),lineMat));
      });
      scene.add(architecture);
      scene.add(new THREE.AmbientLight(0xff7040,2));
      const light=new THREE.PointLight(0xff3b12,25);light.position.set(2,4,4);scene.add(light);

      let visible=true, frame=0, last=0, time=0, pointerX=0, pointerY=0, currentX=0, currentY=0, scroll=0;
      let first = true, contextLost = false, baseY = -1.35;
      const resize=()=>{
        const {width,height}=element.getBoundingClientRect();
        if (width === 0 || height === 0 || contextLost) return;
        renderer.setSize(width,height); composer.setSize(width,height);
        camera.aspect=width/height;
        const mobile=width<768;
        camera.position.set(0,.65,mobile?11.6:8.6);
        camera.lookAt(0,.1,0);
        baseY = mobile ? -1.2 : -1.35;
        group.position.set(mobile ? .16 : 1.65, baseY, 0);
        group.scale.setScalar(mobile ? Math.min(.9, camera.aspect * 1.32) : 1);
        camera.updateProjectionMatrix();
        requestRender();
      };
      const render=(now)=>{
        frame=0;
        if(disposed || contextLost || !visible || document.hidden) { last=0; return; }
        const delta=last?Math.min((now-last)/1000,.05):0;
        if(!pausedRef.current)time+=delta;
        last=pausedRef.current ? 0 : now;
        const arrival = pausedRef.current ? 1 : 1 - Math.pow(1 - Math.min(time / 2.8, 1), 3);
        currentX+=(pointerX-currentX)*.035;currentY+=(pointerY-currentY)*.035;
        group.rotation.y=pausedRef.current?-.10:-.10+(1-arrival)*-.28+currentX*.20+Math.sin(time*.32)*.055;
        group.rotation.x=pausedRef.current?0:currentY*.025;
        group.position.z=pausedRef.current?0:scroll*.7;
        group.position.y=baseY - (1-arrival)*.65;
        material.uniforms.uTime.value=time;
        reflectionMaterial.uniforms.uTime.value=time;
        composer.render();
        if(first){first=false;setReady(true);}
        if(!pausedRef.current)frame=requestAnimationFrame(render);
      };
      function requestRender(){if(!frame&&visible&&!document.hidden&&!contextLost)frame=requestAnimationFrame(render);}
      restart.current=requestRender;
      const pointer=e=>{if(pausedRef.current)return;pointerX=e.clientX/window.innerWidth-.5;pointerY=e.clientY/window.innerHeight-.5;};
      const onScroll=()=>{scroll=Math.min(1,window.scrollY/element.clientHeight);};
      const onVisibility=()=>{last=0;requestRender();};
      const onLoss=()=>{contextLost=true;cancelAnimationFrame(frame);frame=0;setReady(false);};
      const observer=new ResizeObserver(resize);observer.observe(element);
      const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;requestRender();},{rootMargin:'100px'});intersection.observe(element);
      window.addEventListener('pointermove',pointer,{passive:true});
      window.addEventListener('scroll',onScroll,{passive:true});
      document.addEventListener('visibilitychange',onVisibility);
      canvas.addEventListener('webglcontextlost',onLoss);
      resize();
      cleanup=()=>{
        cancelAnimationFrame(frame);restart.current=()=>{};
        observer.disconnect();intersection.disconnect();
        window.removeEventListener('pointermove',pointer);window.removeEventListener('scroll',onScroll);document.removeEventListener('visibilitychange',onVisibility);canvas.removeEventListener('webglcontextlost',onLoss);
        const geometries=new Set(),materials=new Set();
        scene.traverse(obj=>{if(obj.geometry)geometries.add(obj.geometry);if(obj.material)materials.add(obj.material);});
        geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());
        bloom.dispose();output.dispose();composer.dispose();renderer.dispose();canvas.remove();
      };
    }
    init().catch(error=>{console.warn('Sunrise scene unavailable; static composition retained.',error);cleanup();});
    return ()=>{disposed=true;cleanup();};
  },[]);
  return <div className={`sunrise-scene ${ready?'is-ready':''}`} ref={host} aria-hidden="true"><div className="scene-fallback"><div className="fallback-sun"/></div></div>;
}
