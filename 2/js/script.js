// Register GSAP plugin
gsap.registerPlugin(ScrollTrigger);

// Animasi section muncul saat scroll (seperti animasi full di richardmattka.com)
gsap.from("#about", {
    scrollTrigger: "#about",
    x: -200,
    opacity: 0,
    duration: 1,
    ease: "power2.out"
});

gsap.from("#projects", {
    scrollTrigger: "#projects",
    y: 200,
    opacity: 0,
    duration: 1,
    ease: "power2.out"
});

gsap.from("#contact", {
    scrollTrigger: "#contact",
    x: 200,
    opacity: 0,
    duration: 1,
    ease: "power2.out"
});

// Three.js untuk background 3D interaktif (partikel bintang rotating, bisa dirotasi mouse)
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Partikel bintang
const geometry = new THREE.BufferGeometry();
const vertices = [];
for (let i = 0; i < 10000; i++) {
    vertices.push(THREE.MathUtils.randFloatSpread(2000)); // x
    vertices.push(THREE.MathUtils.randFloatSpread(2000)); // y
    vertices.push(THREE.MathUtils.randFloatSpread(2000)); // z
}
geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
const material = new THREE.PointsMaterial({ color: 0x888888, size: 0.5 });
const particles = new THREE.Points(geometry, material);
scene.add(particles);

camera.position.z = 1;

// Kontrol mouse untuk interaksi (rotasi scene)
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableZoom = false; // Opsional: nonaktifkan zoom jika ingin simple

function animate() {
    requestAnimationFrame(animate);
    particles.rotation.x += 0.0001;
    particles.rotation.y += 0.0001;
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});