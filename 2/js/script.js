gsap.registerPlugin(ScrollTrigger);

// Cinematic animations with GSAP timelines
const tl = gsap.timeline({ defaults: { ease: "power2.out", duration: 1 } });
tl.from(".hero h1", { y: -100, opacity: 0 })
  .from(".subtitle", { y: 100, opacity: 0 }, "-=0.5")
  .from("nav ul li", { stagger: 0.2, x: -50, opacity: 0 }, "-=0.5");

// Scroll-triggered for sections (parallax-like)
gsap.from("#about", { scrollTrigger: "#about", y: 200, opacity: 0, duration: 1.5 });
gsap.from(".project-card", { scrollTrigger: "#projects", stagger: 0.3, y: 100, opacity: 0, duration: 1 });
gsap.from(".package", { scrollTrigger: "#services", stagger: 0.2, scale: 0.8, opacity: 0, duration: 1 });
gsap.from("#contact p", { scrollTrigger: "#contact", stagger: 0.1, x: 100, opacity: 0, duration: 1 });

// Modals interactivity
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => {
        const modalId = `modal-${card.dataset.modal}`;
        const modal = document.getElementById(modalId);
        modal.style.display = 'flex';
        gsap.from(modal.querySelector('.modal-content'), { scale: 0.5, opacity: 0, duration: 0.5 });
    });
});
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });
});

// Three.js with custom GLSL shader for nebula background (complex, mouse interactive)
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, -1000, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

const geometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);
const uniforms = {
    time: { value: 0 },
    resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    mouse: { value: new THREE.Vector2(0, 0) }
};

fetch('shaders/vertex.glsl').then(res => res.text()).then(vertexShader => {
    fetch('shaders/fragment.glsl').then(res => res.text()).then(fragmentShader => {
        const material = new THREE.ShaderMaterial({
            uniforms,
            vertexShader,
            fragmentShader,
            transparent: true
        });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableZoom = false;

        let time = 0;
        function animate() {
            requestAnimationFrame(animate);
            time += 0.01;
            uniforms.time.value = time;
            renderer.render(scene, camera);
        }
        animate();
    });
});

// Mouse interaction for shader distortion
document.addEventListener('mousemove', (e) => {
    uniforms.mouse.value.x = e.clientX / window.innerWidth * 2 - 1;
    uniforms.mouse.value.y = - (e.clientY / window.innerHeight) * 2 + 1;
});

// Resize
window.addEventListener('resize', () => {
    camera.left = window.innerWidth / -2;
    camera.right = window.innerWidth / 2;
    camera.top = window.innerHeight / 2;
    camera.bottom = window.innerHeight / -2;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
});