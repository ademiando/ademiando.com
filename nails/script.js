// Mobile menu toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const nav = document.querySelector('.nav');

mobileMenuBtn.addEventListener('click', () => {
    nav.classList.toggle('active');
    mobileMenuBtn.classList.toggle('active');
});

// Gallery data and filtering
const galleryItems = [
    { category: 'marble', title: 'Marble Design', desc: 'Desain marmer elegan' },
    { category: 'simple', title: 'Simple Elegant', desc: 'Desain simpel dan elegan' },
    { category: 'cute', title: 'Cute Floral', desc: 'Desain bunga yang lucu' },
    { category: 'premium', title: 'Premium Glitter', desc: 'Glitter premium mewah' },
    { category: 'cute', title: 'Cute Animal', desc: 'Desain hewan yang menggemaskan' },
    { category: 'marble', title: 'Marble Effect', desc: 'Efek marmer yang menawan' },
    { category: 'premium', title: 'Premium French', desc: 'French tip premium' },
    { category: 'simple', title: 'Simple Color', desc: 'Warna solid yang elegan' },
    { category: 'premium', title: 'Premium Gemstone', desc: 'Hiasan batu permata mewah' }
];

const galleryGrid = document.querySelector('.gallery-grid');
const filterBtns = document.querySelectorAll('.filter-btn');

// Generate gallery items
function generateGalleryItems() {
    galleryGrid.innerHTML = '';
    
    galleryItems.forEach(item => {
        const galleryItem = document.createElement('div');
        galleryItem.className = `gallery-item ${item.category}`;
        galleryItem.innerHTML = `
            <div class="image-placeholder"></div>
            <div class="overlay">
                <div class="category">${item.category.toUpperCase()}</div>
                <div class="title">${item.title}</div>
            </div>
        `;
        galleryGrid.appendChild(galleryItem);
    });
}

// Filter gallery
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        filterBtns.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');
        
        const filter = btn.dataset.filter;
        
        if (filter === 'all') {
            document.querySelectorAll('.gallery-item').forEach(item => {
                item.style.display = 'block';
            });
        } else {
            document.querySelectorAll('.gallery-item').forEach(item => {
                if (item.classList.contains(filter)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        }
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            if (nav.classList.contains('active')) {
                nav.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            }
        }
    });
});

// Scroll to top button
const scrollTopBtn = document.getElementById('scroll-top');

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Show/hide scroll to top button
window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        scrollTopBtn.style.opacity = '1';
        scrollTopBtn.style.visibility = 'visible';
    } else {
        scrollTopBtn.style.opacity = '0';
        scrollTopBtn.style.visibility = 'hidden';
    }
    
    // Add scrolled class to header
    if (window.scrollY > 50) {
        document.querySelector('.header').classList.add('scrolled');
    } else {
        document.querySelector('.header').classList.remove('scrolled');
    }
});

// Initialize GSAP animations
document.addEventListener('DOMContentLoaded', () => {
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);
    
    // Hero section animations
    gsap.to('.hero-title', {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 0.3
    });
    
    gsap.to('.hero-subtitle', {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 0.6
    });
    
    gsap.to('.hero-cta', {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 0.9
    });
    
    // About section animations
    gsap.to('.about-image', {
        scrollTrigger: {
            trigger: '.about',
            start: 'top 80%'
        },
        opacity: 1,
        x: 0,
        duration: 1
    });
    
    gsap.to('.about-text', {
        scrollTrigger: {
            trigger: '.about',
            start: 'top 80%'
        },
        opacity: 1,
        x: 0,
        duration: 1
    });
    
    // Gallery animations
    gsap.utils.toArray('.gallery-item').forEach((item, i) => {
        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                start: 'top 90%'
            },
            opacity: 0,
            y: 30,
            duration: 0.8,
            delay: i * 0.1
        });
    });
    
    // Pricing animations
    gsap.utils.toArray('.pricing-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: '.pricing',
                start: 'top 80%'
            },
            opacity: 0,
            y: 50,
            duration: 0.8,
            delay: i * 0.2
        });
    });
    
    // Booking animation
    gsap.to('.booking-btn', {
        scrollTrigger: {
            trigger: '.booking',
            start: 'top 80%'
        },
        scale: 1.05,
        yoyo: true,
        repeat: -1,
        duration: 1.5,
        ease: 'power1.inOut'
    });
    
    // Generate gallery items on load
    generateGalleryItems();
});