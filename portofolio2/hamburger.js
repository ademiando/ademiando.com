document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileOverlay = document.getElementById('mobileOverlay');
    const closeMenu = document.getElementById('closeMenu');
    const closeIcon = document.getElementById('closeIcon');

    // Awal: sembunyikan menu dan overlay, siapkan style animasi
    if (mobileMenu) {
        mobileMenu.style.position = 'fixed';
        mobileMenu.style.top = '0';
        mobileMenu.style.right = '0';
        mobileMenu.style.width = '80vw';
        mobileMenu.style.maxWidth = '360px';
        mobileMenu.style.height = '100vh';
        mobileMenu.style.background = '#121212';
        mobileMenu.style.boxShadow = 'rgba(0,0,0,0.3) 0 0 24px';
        mobileMenu.style.transform = 'translateX(100%)';
        mobileMenu.style.transition = 'transform 0.5s cubic-bezier(.49,.24,.33,1), opacity 0.4s';
        mobileMenu.style.opacity = '0';
        mobileMenu.style.zIndex = '9999';
        mobileMenu.style.display = 'block';
        mobileMenu.style.pointerEvents = 'none';
    }
    if (mobileOverlay) {
        mobileOverlay.style.position = 'fixed';
        mobileOverlay.style.top = '0';
        mobileOverlay.style.left = '0';
        mobileOverlay.style.width = '100vw';
        mobileOverlay.style.height = '100vh';
        mobileOverlay.style.background = 'rgba(10,10,10,0.6)';
        mobileOverlay.style.opacity = '0';
        mobileOverlay.style.transition = 'opacity 0.4s';
        mobileOverlay.style.zIndex = '9998';
        mobileOverlay.style.display = 'block';
        mobileOverlay.style.pointerEvents = 'none';
    }
    if (closeIcon) {
        closeIcon.style.transition = 'transform 0.3s, opacity 0.3s';
        closeIcon.style.transform = 'scale(1)';
        closeIcon.style.opacity = '1';
    }

    function openMenu() {
        if (mobileMenu) {
            mobileMenu.style.transform = 'translateX(0)';
            mobileMenu.style.opacity = '1';
            mobileMenu.style.pointerEvents = 'auto';
        }
        if (mobileOverlay) {
            mobileOverlay.style.opacity = '1';
            mobileOverlay.style.pointerEvents = 'auto';
        }
        if (closeIcon) {
            closeIcon.style.transform = 'scale(1.15) rotate(90deg)';
            closeIcon.style.opacity = '1';
            setTimeout(() => {
                closeIcon.style.transform = 'scale(1) rotate(0deg)';
            }, 200);
        }
    }
    function closeMenuFunc() {
        if (mobileMenu) {
            mobileMenu.style.transform = 'translateX(100%)';
            mobileMenu.style.opacity = '0';
            mobileMenu.style.pointerEvents = 'none';
        }
        if (mobileOverlay) {
            mobileOverlay.style.opacity = '0';
            mobileOverlay.style.pointerEvents = 'none';
        }
        if (closeIcon) {
            closeIcon.style.transform = 'scale(0.7) rotate(-90deg)';
            closeIcon.style.opacity = '0.7';
            setTimeout(() => {
                closeIcon.style.transform = 'scale(1) rotate(0deg)';
                closeIcon.style.opacity = '1';
            }, 200);
        }
    }

    menuToggle && menuToggle.addEventListener('click', openMenu);
    closeMenu && closeMenu.addEventListener('click', closeMenuFunc);
    mobileOverlay && mobileOverlay.addEventListener('click', closeMenuFunc);
});
