// Cinematic Parallax Galaxy - Siap tempel di ademiando.com, ga perlu React/npm
// Wajib: Tambahkan di index.html sebelum <script src="test.js"> :
// <script src="https://unpkg.com/three@0.155.0/build/three.min.js"></script>
// <script src="https://unpkg.com/three@0.155.0/examples/js/postprocessing/EffectComposer.js"></script>
// <script src="https://unpkg.com/three@0.155.0/examples/js/postprocessing/RenderPass.js"></script>
// <script src="https://unpkg.com/three@0.155.0/examples/js/postprocessing/UnrealBloomPass.js"></script>

(function () {
  // ===== SETUP CANVAS =====
  let canvas = document.createElement("canvas");
  canvas.id = "parallax-canvas";
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.zIndex = "-1";
  canvas.style.pointerEvents = "none";
  document.body.prepend(canvas);

  // ===== THREE.JS INIT =====
  let scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.00033);

  let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(0, 30, 340);

  let renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.7;

  // ==== POSTPROCESSING BLOOM ====
  let composer = new THREE.EffectComposer(renderer);
  composer.addPass(new THREE.RenderPass(scene, camera));
  composer.addPass(
    new THREE.UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.8, 0.5, 0.85
    )
  );

  // ====== STARS FIELD ======
  let starCount = 3500;
  let starGeo = new THREE.BufferGeometry();
  let starVerts = [];
  for (let i = 0; i < starCount; i++) {
    let r = 300 + Math.random() * 1000;
    let phi = Math.acos(Math.random() * 2 - 1);
    let theta = Math.random() * Math.PI * 2;
    starVerts.push(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    );
  }
  starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starVerts, 3));
  let starMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1.7,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.93,
  });
  let stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // ====== NEBULA/FOG ======
  let nebulaGeo = new THREE.PlaneGeometry(6000, 3500, 64, 64);
  let nebulaMat = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      color1: { value: new THREE.Color(0x1800a8) },
      color2: { value: new THREE.Color(0x8f00ff) },
      opacity: { value: 0.24 },
    },
    vertexShader: `
      varying vec2 vUv;
      uniform float time;
      void main() {
        vUv = uv;
        vec3 pos = position;
        float e = sin(pos.x * 0.01 + time) * cos(pos.y * 0.008 + time) * 17.0;
        pos.z += e;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color1;
      uniform vec3 color2;
      uniform float opacity;
      varying vec2 vUv;
      void main() {
        float f = sin(vUv.x * 12.0) * cos(vUv.y * 13.0);
        vec3 color = mix(color1, color2, f * 0.45 + 0.5);
        float alpha = opacity * (1.0 - length(vUv - 0.5) * 2.0);
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  let nebula = new THREE.Mesh(nebulaGeo, nebulaMat);
  nebula.position.z = -1000;
  scene.add(nebula);

  // ====== PARALLAX CAMERA SCROLL ======
  let targetZ = 340;
  window.addEventListener("scroll", () => {
    let maxScroll = document.body.scrollHeight - window.innerHeight;
    let progress = Math.min(window.scrollY / maxScroll, 1);
    // camera z: dari 340 ke -900 (zoom deep)
    targetZ = 340 + ( -900 - 340 ) * progress;
  });

  // ====== RESIZE HANDLER ======
  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener("resize", onResize);

  // ====== ANIMATION LOOP ======
  let t = 0;
  function animate() {
    t += 0.013;
    // Smooth camera zoom scroll
    camera.position.z += (targetZ - camera.position.z) * 0.07;
    camera.position.y = 36 + Math.sin(t * 0.23) * 3;
    camera.lookAt(0, 0, -1200);

    // Stars rotate pelan
    stars.rotation.y += 0.00022;
    stars.rotation.x += 0.00011;

    // Nebula animate
    nebula.material.uniforms.time.value = t * 0.5;

    composer.render();
    requestAnimationFrame(animate);
  }
  animate();
})();
