document.addEventListener('DOMContentLoaded', function() {
// ========== PARALLAX HD BACKGROUND REALISTIK + ZOOM SCROLL ==========
document.addEventListener('DOMContentLoaded', function() {
  let parallaxCanvas = document.createElement('canvas');
  parallaxCanvas.id = 'parallax-bg';
  parallaxCanvas.style.position = 'fixed';
  parallaxCanvas.style.top = 0;
  parallaxCanvas.style.left = 0;
  parallaxCanvas.style.width = '100vw';
  parallaxCanvas.style.height = '100vh';
  parallaxCanvas.style.zIndex = '-1';
  parallaxCanvas.style.pointerEvents = 'none';
  document.body.prepend(parallaxCanvas);

  let ctx = parallaxCanvas.getContext('2d');
  let width = window.innerWidth;
  let height = window.innerHeight;

  // Buat layer bintang
  let starCount = 350;
  let stars = [];
  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.2 + 0.3,
      alpha: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.03 + 0.01
    });
  }

  // Buat layer nebula/awan galaksi
  function drawNebula(ctx, w, h, mouseX, mouseY, zoom) {
    // Nebula gradient deep blue-purple
    let grad1 = ctx.createRadialGradient(
      w * 0.4 + mouseX * 20, h * 0.35 + mouseY * 20, 10 * zoom,
      w * 0.45 + mouseX * 20, h * 0.4 + mouseY * 20, w * 0.7 * zoom
    );
    grad1.addColorStop(0, 'rgba(120, 0, 210, 0.16)');
    grad1.addColorStop(0.55, 'rgba(31, 18, 47, 0.18)');
    grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.globalAlpha = 0.8;
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = grad1;
    ctx.fillRect(0, 0, w, h);

    let grad2 = ctx.createRadialGradient(
      w * 0.7 + mouseX * 30, h * 0.7 + mouseY * 30, 20 * zoom,
      w * 0.65 + mouseX * 30, h * 0.8 + mouseY * 20, w * 0.5 * zoom
    );
    grad2.addColorStop(0, 'rgba(0, 180, 255, 0.12)');
    grad2.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad2;
    ctx.fillRect(0, 0, w, h);

    // Sedikit hint hijau/emerald
    let grad3 = ctx.createRadialGradient(
      w * 0.55, h * 0.15, 10 * zoom,
      w * 0.52, h * 0.19, w * 0.24 * zoom
    );
    grad3.addColorStop(0, 'rgba(0,255,100,0.13)');
    grad3.addColorStop(0.8, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad3;
    ctx.fillRect(0,0,w,h);

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  // Responsive resize
  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    parallaxCanvas.width = width;
    parallaxCanvas.height = height;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Mouse Parallax
  let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
  function updateMouse(e) {
    let w = window.innerWidth, h = window.innerHeight;
    if (e.touches) {
      targetX = (e.touches[0].clientX/w - 0.5) * 2;
      targetY = (e.touches[0].clientY/h - 0.5) * 2;
    } else {
      targetX = (e.clientX/w - 0.5) * 2;
      targetY = (e.clientY/h - 0.5) * 2;
    }
  }
  window.addEventListener('mousemove', updateMouse);
  window.addEventListener('touchmove', updateMouse);

  // Zoom effect by scroll
  let scrollRatio = 0, zoom = 1;
  function updateZoom() {
    // ScrollY effect, clamp between 1 and 1.25
    scrollRatio = Math.min(1, window.scrollY / (window.innerHeight * 1.2));
    zoom = 1 + 0.2 * scrollRatio;
  }
  window.addEventListener('scroll', updateZoom);

  // Animation loop
  function animateParallax() {
    mouseX += (targetX - mouseX) * 0.1;
    mouseY += (targetY - mouseY) * 0.1;
    updateZoom();

    ctx.clearRect(0,0,width,height);

    // Background deep black
    let gradBg = ctx.createLinearGradient(0, 0, 0, height);
    gradBg.addColorStop(0, '#0a0a13');
    gradBg.addColorStop(1, '#191928');
    ctx.fillStyle = gradBg;
    ctx.fillRect(0, 0, width, height);

    // Draw nebula/awan layer
    drawNebula(ctx, width, height, mouseX*22, mouseY*22, zoom);

    // Draw moving stars (minor movement only)
    for (let i = 0; i < stars.length; i++) {
      let star = stars[i];
      // Sedikit movement paralaks
      let parallaxX = star.x + mouseX * star.r * 24 * (0.18 + star.r * 0.25);
      let parallaxY = star.y + mouseY * star.r * 18 * (0.18 + star.r * 0.25);
      // Efek gerak lambat
      let slowMove = Math.sin(Date.now() * star.speed * 0.22 + i) * 2;
      ctx.beginPath();
      ctx.arc(
        parallaxX * zoom,
        (parallaxY + slowMove) * zoom,
        star.r * zoom,
        0, Math.PI * 2
      );
      ctx.globalAlpha = star.alpha;
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 5 * star.r * zoom;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    requestAnimationFrame(animateParallax);
  }
  animateParallax();
});






  
  // ========== CUBE INTERAKTIF 3D ==========
  const cube = document.querySelector('.cube');
  let angleX = 0;
  let angleY = 0;
  let angleZ = 0;
  let autoRotate = true;

  // Tambahkan variabel untuk reset timer
  let autoRotateTimeout;
  const AUTO_ROTATE_DELAY = 2000; // 2 detik setelah interaksi

  if (cube) {
    // Fungsi untuk aktifkan kembali rotasi otomatis
    function enableAutoRotate() {
      autoRotate = true;
    }

    // Fungsi untuk menunda rotasi otomatis
    function delayAutoRotate() {
      // Clear timeout sebelumnya jika ada
      clearTimeout(autoRotateTimeout);
      // Set timeout baru
      autoRotateTimeout = setTimeout(enableAutoRotate, AUTO_ROTATE_DELAY);
    }

    // Fungsi untuk menangani interaksi user
    function handleUserInteraction() {
      autoRotate = false;
      delayAutoRotate();
    }

    setInterval(() => {
      if (autoRotate) {
        angleX = 15 + 5 * Math.sin(Date.now() / 5000);
        angleY += 0.5;
        cube.style.transform = `rotateX(${angleX}deg) rotateY(${angleY}deg)`;
      }
    }, 15);

    // Drag to rotate (mouse)
    let dragging = false;
    let lastX, lastY;

    cube.parentElement.addEventListener('mousedown', function(e) {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      handleUserInteraction(); // Panggil fungsi interaksi
    });

    window.addEventListener('mousemove', function(e) {
      if (dragging) {
        let deltaX = e.clientX - lastX;
        let deltaY = e.clientY - lastY;
        angleY += deltaX * 0.8;
        angleX -= deltaY * 0.8;
        cube.style.transform = `rotateX(${angleX}deg) rotateY(${angleY}deg) rotateZ(${angleZ}deg)`;
        lastX = e.clientX;
        lastY = e.clientY;
      }
    });

    window.addEventListener('mouseup', function() {
      if (dragging) {
        dragging = false;
        handleUserInteraction(); // Panggil saat interaksi selesai
      }
    });

    // Drag to rotate (touch / mobile)
    cube.parentElement.addEventListener('touchstart', function(e) {
      dragging = true;
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
      handleUserInteraction(); // Panggil fungsi interaksi
    });

    window.addEventListener('touchmove', function(e) {
      if (dragging) {
        let deltaX = e.touches[0].clientX - lastX;
        let deltaY = e.touches[0].clientY - lastY;
        angleY += deltaX * 0.8;
        angleX -= deltaY * 0.8;
        cube.style.transform = `rotateX(${angleX}deg) rotateY(${angleY}deg) rotateZ(${angleZ}deg)`;
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
      }
    });

    window.addEventListener('touchend', function() {
      if (dragging) {
        dragging = false;
        handleUserInteraction();
      }
    });
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 70,
          behavior: 'smooth'
        });
      }
    });
  });

  // Accordion functionality
  document.querySelectorAll('.accordion-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      this.classList.toggle('active');
      const panel = this.nextElementSibling;

      if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
      } else {
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  // Mobile menu toggle
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function() {
      this.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
  }

  // Add animation on scroll
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe sections
  document.querySelectorAll('.section, .hero-section, .portfolio-card, .paket-card').forEach(section => {
    observer.observe(section);
  });

  // Form submission handling
  const form = document.querySelector('form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();

      // Form submission logic
      const formData = new FormData(this);

      // Simulate form submission
      fetch(this.action, {
        method: this.method,
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
      .then(response => {
        if (response.ok) {
          alert('Pesan berhasil dikirim! Kami akan menghubungi Anda segera.');
          form.reset();
        } else {
          throw new Error('Network response was not ok.');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Terjadi kesalahan. Silakan coba lagi atau hubungi kami via WhatsApp.');
      });
    });
  }
});
