function initPreloader() {
    const preloader = document.getElementById('preloader');
    const progressBar = document.getElementById('preloaderProgressBar');
    const counter = document.getElementById('preloaderCounter');
    
    if (!preloader) return;
    
    document.body.style.overflow = 'hidden';
    
    let progress = 0;
    const duration = 2200; // 2.2s loading duration
    const intervalTime = 20;
    const step = (100 / (duration / intervalTime));
    
    const interval = setInterval(() => {
        progress += step;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            if (progressBar) progressBar.style.width = '100%';
            if (counter) counter.textContent = '100%';
            
            setTimeout(() => {
                preloader.classList.add('fade-out');
                document.body.style.overflow = '';
                setTimeout(() => {
                    if (preloader && preloader.parentNode) {
                        preloader.parentNode.removeChild(preloader);
                    }
                }, 850);
            }, 300);
        } else {
            const roundedProgress = Math.floor(progress);
            if (progressBar) progressBar.style.width = `${roundedProgress}%`;
            if (counter) counter.textContent = `${roundedProgress}%`;
        }
    }, intervalTime);
}

function initCoreInteractions() {
    initPreloader();
    
    // Mobile Menu functionality
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileOverlay = document.getElementById('mobileOverlay');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    
    function toggleMobileMenu() {
        hamburgerMenu.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        mobileOverlay.classList.toggle('active');
        hamburgerMenu.setAttribute('aria-expanded', mobileMenu.classList.contains('active') ? 'true' : 'false');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    }
    
    function closeMobileMenu() {
        hamburgerMenu.classList.remove('active');
        mobileMenu.classList.remove('active');
        mobileOverlay.classList.remove('active');
        hamburgerMenu.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }
    
    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', toggleMobileMenu);
    }
    
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', closeMobileMenu);
    }
    
    // Close menu when clicking a nav link
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // Scroll to Top
    const scrollTopBtn = document.getElementById('scrollTopBtn');

    window.addEventListener('scroll', function () {
        if (!scrollTopBtn) {
            return;
        }

        if (window.scrollY > 400) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    }, { passive: true });

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCoreInteractions, { once: true });
} else {
    initCoreInteractions();
}
