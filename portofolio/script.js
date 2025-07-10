// Three.js Background Animation
const initThree = () => {
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('three-canvas'),
        alpha: true,
        antialias: true
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Camera position
    camera.position.z = 5;
    
    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    
    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);
    
    for(let i = 0; i < particlesCount * 3; i++) {
        // Position
        posArray[i] = (Math.random() - 0.5) * 10;
        
        // Color (RGB)
        colorArray[i] = Math.random();
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    
    // Material
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.02,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });
    
    // Mesh
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    
    // Mouse movement effect
    document.addEventListener('mousemove', (e) => {
        camera.position.x = (e.clientX / window.innerWidth - 0.5) * 2;
        camera.position.y = -(e.clientY / window.innerHeight - 0.5) * 2;
        camera.lookAt(scene.position);
    });
    
    // Animation loop
    const animate = () => {
        requestAnimationFrame(animate);
        
        // Rotate particles
        particlesMesh.rotation.x += 0.001;
        particlesMesh.rotation.y += 0.002;
        
        renderer.render(scene, camera);
    };
    
    // Handle resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    animate();
};

// GSAP Animations
const initAnimations = () => {
    // Initialize ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);
    
    // Animate sections on scroll
    gsap.utils.toArray('.section').forEach(section => {
        gsap.from(section, {
            opacity: 0,
            y: 50,
            duration: 1,
            scrollTrigger: {
                trigger: section,
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        });
    });
    
    // Animate elements
    gsap.from('.logo', {
        opacity: 0,
        x: -20,
        duration: 1,
        delay: 0.5
    });
    
    gsap.from('.nav-links li', {
        opacity: 0,
        y: -20,
        duration: 0.5,
        stagger: 0.1,
        delay: 0.8
    });
    
    gsap.from('.hero-content', {
        opacity: 0,
        y: 30,
        duration: 1,
        delay: 1
    });
    
    // Rotating text animation
    const rotatingWords = ["Memukau", "Bermakna", "Interaktif", "Responsif", "Inovatif"];
    let currentIndex = 0;
    const rotateText = document.querySelector('.rotate-text');
    
    function rotateWords() {
        gsap.to(rotateText, {
            opacity: 0,
            y: 20,
            duration: 0.5,
            onComplete: () => {
                currentIndex = (currentIndex + 1) % rotatingWords.length;
                rotateText.textContent = rotatingWords[currentIndex];
                gsap.to(rotateText, {
                    opacity: 1,
                    y: 0,
                    duration: 0.5
                });
            }
        });
    }
    
    setInterval(rotateWords, 3000);
};

// Load data from JSON
const loadData = async () => {
    try {
        const response = await fetch('projects.json');
        const data = await response.json();
        
        // Render skills
        const skillsContainer = document.getElementById('skills-container');
        data.skills.forEach(skill => {
            const skillEl = document.createElement('div');
            skillEl.className = 'skill-tag animate';
            skillEl.textContent = skill;
            skillsContainer.appendChild(skillEl);
        });
        
        // Render projects
        const projectsContainer = document.getElementById('projects-container');
        data.projects.forEach((project, index) => {
            const projectEl = document.createElement('div');
            projectEl.className = `project-card animate delay-${index % 3}`;
            projectEl.innerHTML = `
                <div class="project-info">
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                    <div class="project-tags">
                        ${project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
                    </div>
                    <a href="${project.link}" class="btn" target="_blank">Lihat Detail</a>
                </div>
            `;
            projectsContainer.appendChild(projectEl);
        });
        
        // Render contact info
        const contactContainer = document.getElementById('contact-container');
        data.contact.forEach(contact => {
            const contactEl = document.createElement('div');
            contactEl.className = 'contact-item';
            contactEl.innerHTML = `
                <div class="contact-icon">
                    <i class="${contact.icon}"></i>
                </div>
                <div class="contact-text">
                    <h4>${contact.title}</h4>
                    ${contact.link ? `<a href="${contact.link}">${contact.value}</a>` : `<p>${contact.value}</p>`}
                </div>
            `;
            contactContainer.appendChild(contactEl);
        });
        
        // Render social links
        const socialContainer = document.getElementById('social-container');
        data.social.forEach(social => {
            const socialEl = document.createElement('a');
            socialEl.className = 'social-link';
            socialEl.href = social.link;
            socialEl.target = '_blank';
            socialEl.innerHTML = `<i class="${social.icon}"></i>`;
            socialContainer.appendChild(socialEl);
        });
        
        // Render footer navigation
        const footerNav = document.getElementById('footer-nav');
        data.footerNav.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="${item.link}">${item.title}</a>`;
            footerNav.appendChild(li);
        });
        
        // Render services navigation
        const servicesNav = document.getElementById('services-nav');
        data.services.forEach(service => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="${service.link}">${service.title}</a>`;
            servicesNav.appendChild(li);
        });
        
    } catch (error) {
        console.error('Error loading data:', error);
    }
};

// Mobile Navigation
const initMobileNav = () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.innerHTML = navLinks.classList.contains('active') ? 
            '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });
    
    // Close menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });
};

// Smooth Scrolling
const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
};

// Header scroll effect
const initHeaderEffect = () => {
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        header.classList.toggle('scrolled', window.scrollY > 50);
    });
};

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    initThree();
    initAnimations();
    loadData();
    initMobileNav();
    initSmoothScroll();
    initHeaderEffect();
});