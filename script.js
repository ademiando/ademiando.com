document.addEventListener('DOMContentLoaded', function() {

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

    //  angleX = (angleX + 0.1) % 360;
    //  angleY = (angleY + 0.3) % 360;

    // const time = Date.now();
    // angleX = 15 + 5 * Math.sin(time / 8000);
    // angleY = 15 + 10 * Math.sin(time / 10000);

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

 

 
  // Initialize Particles.js warna hijau
  particlesJS('particles-js', {
    particles: {
      number: {
        value: 40, // 80,
        density: {
          enable: true,
          value_area: 800
        }
      },
      color: {
        value: '#39FF14' // hijau neon
      },
      shape: {
        type: 'circle',
        stroke: {
          width: 0,
          color: '#000000'
        }
      },
      opacity: {
        value: 0.8, // Tingkatan opacity
        random: true,
        anim: {
          enable: true,
          speed: 1,
          opacity_min: 0.3, // Minimal opacity
          sync: false
        }
      },
      size: {
        value: 3,
        random: true,
        anim: {
          enable: true,
          speed: 3,
          size_min: 0.1,
          sync: false
        }
      },
      line_linked: {
        enable: true,
        distance: 150,
        color: '#39FF14', // Hijau neon
        opacity: 0.4,    // Opacity garis
        width: 1
      },
      move: {
        enable: true,
        speed: 1,
        direction: 'none',
        random: true,
        straight: false,
        out_mode: 'out',
        bounce: false,
        attract: {
          enable: false,
          rotateX: 600,
          rotateY: 1200
        }
      }
    },
    interactivity: {
      detect_on: 'canvas',
      events: {
        onhover: {
          enable: true,
          mode: 'grab'
        },
        onclick: {
          enable: true,
          mode: 'push'
        },
        resize: true
      },
      modes: {
        grab: {
          distance: 140,
          line_linked: {
            opacity: 1
          }
        },
        push: {
          particles_nb: 4
        }
      }
    },
    retina_detect: true
  });

  // CSS untuk efek glow pada partikel
  const style = document.createElement('style');
  style.innerHTML = `
    #particles-js canvas {
      filter: 
        drop-shadow(0 0 2px #39FF14)
        drop-shadow(0 0 5px #39FF14)
        drop-shadow(0 0 15px #39FF14);
      animation: glow-pulse 2s infinite alternate;
    }
    
    @keyframes glow-pulse {
      0% { 
        filter: 
          drop-shadow(0 0 2px #39FF14)
          drop-shadow(0 0 5px #39FF14)
          drop-shadow(0 0 15px #39FF14);
      }
      100% { 
        filter: 
          drop-shadow(0 0 5px #39FF14)
          drop-shadow(0 0 10px #39FF14)
          drop-shadow(0 0 25px #39FF14);
      }
    }
  `;
  document.head.appendChild(style);


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
