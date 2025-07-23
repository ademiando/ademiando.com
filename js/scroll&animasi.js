// script.js

document.addEventListener('DOMContentLoaded', () => {
  // 1. Definisikan selector elemen yang mau dianimasikan
  const selectors = [
    '.portfolio-grid > *',       // semua direct child di portfolio grid
    '.paket-container > *',      // semua card paket
    '.addons-section .accordion-item' // setiap accordion item
    // tambahkan selector lain sesuai kebutuhan
  ];

  // 2. Gabungkan NodeList jadi satu array elemen
  const targets = selectors
    .map(sel => Array.from(document.querySelectorAll(sel)))
    .flat();

  // 3. Buat IntersectionObserver
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.animate([
          { opacity: 0, transform: 'translateY(20px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], {
          duration: 600,
          easing: 'ease-out',
          fill: 'forwards'
        });
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  // 4. Observe tiap target
  targets.forEach(el => observer.observe(el));
});