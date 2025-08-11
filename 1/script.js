// Modular Script: Functions untuk Inisialisasi dan Animasi
// Libraries sudah di-load di HTML via CDN

let scene, camera, renderer, composer, controls, mesh, particles;
const clock = new THREE.Clock();

// Function 1: Init Three.js Scene (Cinematic Background)
function initScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true; // Tambah Shadows untuk Depth
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Lights: Ambient + Point untuk Cinematic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1.5, 100);
    pointLight.position.set(10, 10, 10);
    pointLight.castShadow = true;
    scene.add(pointLight);

    // Main Mesh: TorusKnot dengan Advanced Shader (Noise Distortion untuk Film-like Effect)
    const geometry = new THREE.TorusKnotGeometry(1.5, 0.5, 128, 32);
    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            distortion: { value: 0.3 },
            noiseScale: { value: 2.0 } // Tambah Noise untuk Mirip Film Grain
        },
        vertexShader: `
            uniform float time;
            uniform float distortion;
            uniform float noiseScale;
            varying vec2 vUv;
            float noise(vec3 p) { // Simple Perlin Noise Function
                return sin(p.x * noiseScale) * sin(p.y * noiseScale) * sin(p.z * noiseScale);
            }
            void main() {
                vUv = uv;
                vec3 pos = position;
                float n = noise(pos + time);
                pos += normal * (sin(time + pos.y * 5.0) * distortion + n * 0.1);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `,
        fragmentShader: `
            varying vec2 vUv;
            void main() {
                vec3 color = vec3(sin(vUv.x * 10.0), cos(vUv.y * 10.0), 0.5);
                gl_FragColor = vec4(color, 1.0);
            }
        `,
        wireframe: false, // Solid untuk Lebih Realistic
        side: THREE.DoubleSide
    });
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    camera.position.z = 6;

    // Orbit Controls untuk Mouse Interaksi (Drag Rotate seperti di Situs)
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.enableZoom = false; // Disable Zoom untuk Focus Cinematic

    // Post-Processing: Bloom + Custom Shader Pass untuk Glow Effect
    composer = new THREE.EffectComposer(renderer);
    const renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);
    const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.2, 0.3, 0.8);
    composer.addPass(bloomPass);
}

// Function 2: Init Particle System (Stars/Fog untuk Immersive Background)
function initParticles() {
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 5000;
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 10;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.005,
        color: 0xffffff,
        blending: THREE.AdditiveBlending,
        transparent: true
    });
    particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
}

// Function 3: Animate Loop (Update Shader, Rotate, Render)
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    material.uniforms.time.value += delta * 0.5; // Slower untuk Cinematic
    mesh.rotation.x += 0.005;
    mesh.rotation.y += 0.005;
    particles.rotation.y += 0.001; // Slow Particle Drift
    controls.update();
    composer.render();
}

// Function 4: GSAP Animations dan Scroll Triggers
function initGSAP() {
    gsap.registerPlugin(ScrollTrigger);

    // Header Fade In
    gsap.from("#header", { opacity: 0, y: -200, duration: 2, ease: "power4.out" });

    // Sections Animations: Fade + Slide, dengan Camera Pan
    const sections = document.querySelectorAll('.section');
    sections.forEach((sec, index) => {
        gsap.to(sec, {
            opacity: 1,
            y: 0,
            duration: 1.5,
            ease: "power4.out",
            scrollTrigger: {
                trigger: sec,
                start: "top 80%",
                end: "bottom 20%",
                scrub: 1, // Smooth Linked to Scroll
                onUpdate: (self) => {
                    // Cinematic Camera Movement berdasarkan Scroll Progress
                    camera.position.z = 6 + self.progress * 2; // Zoom Out
                    camera.rotation.y = self.progress * Math.PI / 4; // Rotate Slight
                }
            }
        });
    });

    // Pin Header untuk Sticky Effect seperti Film Title
    ScrollTrigger.create({
        trigger: "#header",
        start: "top top",
        pin: true,
        pinSpacing: false,
        end: "+=500"
    });

    // Hover Effects pada Projects (Scale + Glow Timeline)
    document.querySelectorAll('.project').forEach(proj => {
        const tl = gsap.timeline({ paused: true });
        tl.to(proj, { scale: 1.1, duration: 0.4, ease: "power2.out" });
        tl.to(proj, { boxShadow: "0 0 40px rgba(0, 255, 0, 0.7)", duration: 0.4, ease: "power2.out" }, "-=0.4");
        proj.addEventListener('mouseenter', () => tl.play());
        proj.addEventListener('mouseleave', () => tl.reverse());
    });
}

// Function 5: Modal Handling (Popup untuk Project Details dengan GSAP Fade)
function initModals() {
    const modal = document.getElementById('modal');
    const closeBtn = document.querySelector('.close');
    const title = document.getElementById('modal-title');
    const desc = document.getElementById('modal-desc');
    const img = document.getElementById('modal-img');

    // Dummy Data untuk Modals (Tambah Lebih Banyak untuk Spesifik)
    const modalData = {
        project1: { title: "Responsive E-commerce", desc: "Detail: Built with React, animations via GSAP, integrated API.", img: "https://source.unsplash.com/random/800x600/?web" },
        project2: { title: "Data Dashboard", desc: "Detail: Real-time data with WebSockets and 3D charts.", img: "https://source.unsplash.com/random/800x600/?dashboard" },
        project3: { title: "3D Portfolio", desc: "Detail: This site replica with custom shaders.", img: "https://source.unsplash.com/random/800x600/?portfolio" },
        proto1: { title: "AR Prototype", desc: "Detail: WebAR using 8th Wall.", img: "https://source.unsplash.com/random/800x600/?prototype" },
        proto2: { title: "VR Interface", desc: "Detail: VR-ready with A-Frame.", img: "https://source.unsplash.com/random/800x600/?vr" },
        art1: { title: "Shader Art", desc: "Detail: GLSL experiments for abstract visuals.", img: "https://source.unsplash.com/random/800x600/?art" },
        art2: { title: "Generative Patterns", desc: "Detail: Procedural generation with p5.js.", img: "https://source.unsplash.com/random/800x600/?abstract" }
    };

    document.querySelectorAll('.project').forEach(proj => {
        proj.addEventListener('click', () => {
            const data = modalData[proj.dataset.modal];
            title.textContent = data.title;
            desc.textContent = data.desc;
            img.src = data.img;
            modal.style.display = "block";
            gsap.from(".modal-content", { opacity: 0, scale: 0.8, duration: 0.5, ease: "back.out(1.7)" });
        });
    });

    closeBtn.addEventListener('click', () => {
        gsap.to(".modal-content", { opacity: 0, scale: 0.8, duration: 0.3, ease: "power2.in", onComplete: () => modal.style.display = "none" });
    });
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeBtn.click();
    });
}

// Function 6: Resize Handler
function onResize() {
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Init All on Load
window.addEventListener('DOMContentLoaded', () => {
    initScene();
    initParticles();
    animate();
    initGSAP();
    initModals();
    onResize();
});