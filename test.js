document.addEventListener('DOMContentLoaded', function() {

  // ========== PARALLAX HD BACKGROUND ==========
  // Buat canvas untuk background paralaks
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

  // Konfigurasi layer paralaks
  let layers = [
    {
      // Layer belakang: gradasi bintang
      draw: function(w, h, mx, my) {
        let grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#0d1b2a');
        grad.addColorStop(1, '#1b263b');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Bintang random
        for(let i=0; i<150; i++) {
          let x = Math.random()*w;
          let y = Math.random()*h;
          ctx.beginPath();
          ctx.arc(x, y, Math.random()*0.8+0.2, 0, Math.PI*2);
          ctx.fillStyle = 'rgba(255,255,255,'+(Math.random()*0.7+0.2)+')';
          ctx.fill();
        }
      },
      depth: 0.02
    },
    {
      // Layer awan/nebula (pakai gradient neon hijau)
      draw: function(w, h, mx, my) {
        let grad = ctx.createRadialGradient(
          w*0.7+mx*30, h*0.3+my*30, 10,
          w*0.7+mx*30, h*0.3+my*30, w/2
        );
        grad.addColorStop(0, 'rgba(57,255,20,0.15)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      },
      depth: 0.04
    },
    {
      // Layer depan: partikel neon/interaktif
      draw: function(w, h, mx, my) {
        for(let i=0; i<35; i++) {
          let t = Date.now()/1000 + i;
          let x = (w/2) + Math.sin(t+i)*w*0.35 + mx*90;
          let y = (h/2) + Math.cos(t+i*1.5)*h*0.28 + my*60;
          ctx.beginPath();
          ctx.arc(x, y, 7+6*Math.sin(t+i*0.7), 0, Math.PI*2);
          ctx.shadowColor = '#39FF14';
          ctx.shadowBlur = 22;
          ctx.fillStyle = 'rgba(57,255,20,0.28)';
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      },
      depth: 0.09
    }
  ];

  // Track mouse/touch untuk efek interaktif paralaks
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

  // Responsive resize
  function resizeCanvas() {
    parallaxCanvas.width = window.innerWidth;
    parallaxCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Main animation loop
  function animateParallax() {
    mouseX += (targetX - mouseX) * 0.07;
    mouseY += (targetY - mouseY) * 0.07;
    let w = parallaxCanvas.width, h = parallaxCanvas.height;
    ctx.clearRect(0,0,w,h);
    layers.forEach(layer => {
      ctx.save();
      ctx.translate(w*layer.depth*mouseX, h*layer.depth*mouseY);
      layer.draw(w, h, mouseX, mouseY);
      ctx.restore();
    });
    requestAnimationFrame(animateParallax);
  }
  animateParallax();

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
