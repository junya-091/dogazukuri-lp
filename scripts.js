// === Intersection Observer for scroll animations ===
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
        }
    });
}, observerOptions);

document.querySelectorAll('.scroll-reveal').forEach(el => {
    observer.observe(el);
});

// === Custom cursor ===
const cursor = document.querySelector('.custom-cursor');

if (cursor) {
    let cursorX = 0, cursorY = 0;
    let cursorFollowX = 0, cursorFollowY = 0;

    document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
    });

    document.querySelectorAll('a, button, .btn').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });

    function animateCursor() {
        cursorFollowX += (cursorX - cursorFollowX) * 0.4;
        cursorFollowY += (cursorY - cursorFollowY) * 0.4;

        cursor.style.left = cursorFollowX + 'px';
        cursor.style.top = cursorFollowY + 'px';

        requestAnimationFrame(animateCursor);
    }
    animateCursor();
}

// === Parallax scrolling ===
let ticking = false;

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            const scrolled = window.pageYOffset;
            const heroBg = document.querySelector('.hero-bg');
            if (heroBg && scrolled < window.innerHeight) {
                heroBg.style.transform = `translateY(${scrolled * 0.5}px)`;
            }
            ticking = false;
        });
        ticking = true;
    }
});

// === Magnetic button effect ===
document.querySelectorAll('.btn-primary, .btn-large').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });

    btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
    });
});

// === Character-by-character animation ===
document.querySelectorAll('.animate-text').forEach(el => {
    const text = el.textContent;
    el.textContent = '';

    text.split('').forEach((char, i) => {
        const span = document.createElement('span');
        span.className = 'char-animation';
        span.style.animationDelay = `${i * 0.05}s`;
        span.textContent = char === ' ' ? '\u00A0' : char;
        el.appendChild(span);
    });
});

// === Glitch effect control ===
// ※ブラーインエフェクトに変更したため削除（アニメーションは自動完了）
