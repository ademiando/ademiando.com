document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileOverlay = document.getElementById('mobileOverlay');
    const closeMenu = document.getElementById('closeMenu');

    // Awal: pastikan menu & overlay hidden
    if (mobileMenu) mobileMenu.style.display = 'none';
    if (mobileOverlay) mobileOverlay.style.display = 'none';

    // Buka menu
    menuToggle.addEventListener('click', function() {
        if (mobileMenu) mobileMenu.style.display = 'block';
        if (mobileOverlay) mobileOverlay.style.display = 'block';
    });

    // Tutup menu
    closeMenu.addEventListener('click', function() {
        if (mobileMenu) mobileMenu.style.display = 'none';
        if (mobileOverlay) mobileOverlay.style.display = 'none';
    });

    // Klik overlay juga tutup menu
    mobileOverlay.addEventListener('click', function() {
        if (mobileMenu) mobileMenu.style.display = 'none';
        if (mobileOverlay) mobileOverlay.style.display = 'none';
    });
});
