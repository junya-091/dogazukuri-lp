(function () {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const worksListUrl = 'https://youtube.com/playlist?list=PLB2I6LBVOxi4Pj22zJPSdzmQNFcC7oBZR';
    const categoryLabels = {
        sns: 'SNSショート',
        recruit: '採用・求人',
        pr: '店舗・企業PR',
        school: '医療・学校',
        ai: 'AI映像',
        event: 'イベント・配信'
    };
    const workItems = [
        {
            title: '《放課後に残された僕らへ》',
            image: 'assets/works/work-wide-01.jpg',
            url: 'https://youtu.be/_PX9zNt_RBM?si=2OZE7c_Oglg2RqLN',
            category: 'ai',
            aspect: 'wide'
        },
        {
            title: '失敗しない塾選び',
            image: 'assets/works/work-wide-02.jpg',
            category: 'school',
            aspect: 'wide'
        },
        {
            title: '配当管理ツール解説',
            image: 'assets/works/work-wide-03.jpg',
            url: 'https://youtu.be/tGgwI5klNRE',
            category: 'pr',
            aspect: 'wide'
        },
        {
            title: '質問回答',
            image: 'assets/works/work-wide-04.jpg',
            category: 'event',
            aspect: 'wide'
        },
        {
            title: 'Cosa Mangiane？',
            image: 'assets/works/work-wide-05.jpg',
            url: 'https://youtu.be/ijXQetPbhmg?si=XH6Wjt75bCHyB1_h',
            category: 'pr',
            aspect: 'wide'
        },
        {
            title: 'AI解説動画',
            image: 'assets/works/work-wide-06.jpg',
            url: 'https://youtu.be/4jF-W4IyOpE',
            category: 'ai',
            aspect: 'wide'
        },
        {
            title: '懇親会',
            image: 'assets/works/work-wide-07.jpg',
            url: 'https://youtu.be/S_oA73fIqlw?si=GMyx3ECYU9IrmpsW',
            category: 'event',
            aspect: 'wide'
        },
        {
            title: '楽器弾いてみた',
            image: 'assets/works/work-wide-08.jpg',
            url: 'https://youtu.be/_WqIKayOqpY',
            category: 'event',
            aspect: 'wide'
        },
        {
            title: '社員インタビュー',
            image: 'assets/works/work-wide-09.jpg',
            url: 'https://youtu.be/wAwtVObvZ8I?si=1MXSywrGWUAQjsYR',
            category: 'recruit',
            aspect: 'wide'
        },
        {
            title: '商品PV',
            image: 'assets/works/work-wide-10.jpg',
            url: 'https://youtu.be/3S0DLx4xRoA',
            category: 'pr',
            aspect: 'wide'
        },
        {
            title: 'アニメーション',
            image: 'assets/works/work-wide-11.jpg',
            url: 'https://youtu.be/w6j7Z4yre5w?si=FElVC0XHO6pUjaTc',
            category: 'ai',
            aspect: 'wide'
        },
        {
            title: 'Amazon商品PV',
            image: 'assets/works/work-wide-12.jpg',
            url: 'https://youtu.be/21_NE5654Lc',
            category: 'pr',
            aspect: 'wide'
        },
        {
            title: '個別塾PV',
            image: 'assets/works/work-wide-13.jpg',
            url: 'https://youtu.be/Xzwvb6AoqeI?si=t8Nc5Nzv55gTuNvS',
            category: 'school',
            aspect: 'wide'
        },
        {
            title: 'ポートフォリオ',
            image: 'assets/works/work-wide-14.jpg',
            url: 'https://youtu.be/x_SnvOmTMlM',
            category: 'pr',
            aspect: 'wide'
        },
        {
            title: 'Webスクール紹介',
            image: 'assets/works/work-wide-15.jpg',
            category: 'school',
            aspect: 'wide'
        },
        {
            title: 'Amazon商品使用方法解説',
            image: 'assets/works/work-wide-16.jpg',
            url: 'https://youtu.be/BIaHU3LDTPE',
            category: 'pr',
            aspect: 'wide'
        },
        {
            title: 'キャリア教育',
            image: 'assets/works/work-wide-17.jpg',
            url: 'https://youtu.be/nJRq_3Ye_5A',
            category: 'school',
            aspect: 'wide'
        },
        {
            title: 'エンタメ動画',
            image: 'assets/works/work-wide-18.jpg',
            category: 'event',
            aspect: 'wide'
        },
        {
            title: 'きのこ×復讐劇🍄',
            image: 'assets/works/work-wide-19.jpg',
            url: 'https://www.instagram.com/reel/DY9wCyhBkIv/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==',
            category: 'ai',
            aspect: 'wide'
        },
        {
            title: '教育クイズ問題',
            image: 'assets/works/work-wide-20.jpg',
            category: 'school',
            aspect: 'wide'
        },
        {
            title: '病院紹介',
            image: 'assets/works/work-short-01.jpg',
            url: 'https://www.tiktok.com/@tsusewko1fb/video/7317938908371619079',
            category: 'school',
            aspect: 'short'
        },
        {
            title: '社員研修',
            image: 'assets/works/work-short-02.jpg',
            url: 'https://www.tiktok.com/@uenishikougyou/video/7362469879561080071',
            category: 'recruit',
            aspect: 'short'
        },
        {
            title: '作業着紹介',
            image: 'assets/works/work-short-03.jpg',
            url: 'https://www.tiktok.com/@sagyouhukuk/video/7381765447508626695',
            category: 'recruit',
            aspect: 'short'
        },
        {
            title: '社員募集',
            image: 'assets/works/work-short-04.jpg',
            url: 'https://www.tiktok.com/@kameda_7777/video/7645235742394109204',
            category: 'recruit',
            aspect: 'short'
        },
        {
            title: '楽器弾いてみた',
            image: 'assets/works/work-short-05.jpg',
            url: 'https://www.tiktok.com/@himobass/video/7436332310984789255',
            category: 'event',
            aspect: 'short'
        },
        {
            title: '飲食店紹介',
            image: 'assets/works/work-short-06.jpg',
            url: 'https://www.tiktok.com/@mogu_bistro.coffee/video/7355048178502192392',
            category: 'pr',
            aspect: 'short'
        },
        {
            title: '看護師募集',
            image: 'assets/works/work-short-07.jpg',
            url: 'https://www.tiktok.com/@heartland_kango/video/7485985711611497729',
            category: 'recruit',
            aspect: 'short'
        },
        {
            title: '看護学校紹介',
            image: 'assets/works/work-short-08.jpg',
            url: 'https://www.tiktok.com/@heartlandshigisannurse/video/7503445447286066450',
            category: 'school',
            aspect: 'short'
        },
        {
            title: 'ホワイトニング商品紹介',
            image: 'assets/works/work-short-09.jpg',
            url: 'https://www.tiktok.com/@hanikoishitemasu/video/7563599286643019016',
            category: 'pr',
            aspect: 'short'
        },
        {
            title: '個別塾紹介',
            image: 'assets/works/work-short-10.jpg',
            url: 'https://youtube.com/shorts/KqEVd9BJSzU',
            category: 'school',
            aspect: 'short'
        },
        {
            title: '看護師の1日',
            image: 'assets/works/work-short-11.jpg',
            url: 'https://www.tiktok.com/@tsusewko1fb/video/7311639810538491154',
            category: 'recruit',
            aspect: 'short'
        },
        {
            title: '社長紹介',
            image: 'assets/works/work-short-12.jpg',
            url: 'https://www.tiktok.com/@uenishikougyou/video/7377312905458437383',
            category: 'recruit',
            aspect: 'short'
        },
        {
            title: '作業靴紹介',
            image: 'assets/works/work-short-13.jpg',
            url: 'https://www.tiktok.com/@sagyouhukuk/video/7431490697435352338',
            category: 'pr',
            aspect: 'short'
        },
        {
            title: '会社紹介',
            image: 'assets/works/work-short-14.jpg',
            url: 'https://www.tiktok.com/@kameda_7777/video/7558339815297535248',
            category: 'recruit',
            aspect: 'short'
        },
        {
            title: '看護師紹介',
            image: 'assets/works/work-short-15.jpg',
            url: 'https://www.tiktok.com/@heartland_kango/video/7549124021602848008',
            category: 'recruit',
            aspect: 'short'
        },
        {
            title: '看護学校あるある',
            image: 'assets/works/work-short-16.jpg',
            url: 'https://www.tiktok.com/@heartlandshigisannurse/video/7469712440222141704',
            category: 'school',
            aspect: 'short'
        },
        {
            title: '美容クリニック紹介',
            image: 'assets/works/work-short-17.jpg',
            url: 'https://www.tiktok.com/@gakuennmaewellnessclinic/video/7489307140901834004',
            category: 'pr',
            aspect: 'short'
        },
        {
            title: 'ホワイトニング商品紹介',
            image: 'assets/works/work-short-18.jpg',
            url: 'https://www.tiktok.com/@hanikoishitemasu/video/7542833594755157266',
            category: 'pr',
            aspect: 'short'
        },
        {
            title: '清掃の豆知識紹介',
            image: 'assets/works/work-short-19.jpg',
            url: 'https://www.tiktok.com/@kameda_7777/video/7611467000652565780',
            category: 'pr',
            aspect: 'short'
        },
        {
            title: '美装屋の1日',
            image: 'assets/works/work-short-20.jpg',
            url: 'https://www.tiktok.com/@kameda_7777/video/7595882830865894676',
            category: 'recruit',
            aspect: 'short'
        }
    ].map(function (item) {
        return Object.assign({
            id: item.image.replace(/^.*\//, '').replace(/\.[^.]+$/, ''),
            url: worksListUrl,
            categoryLabel: categoryLabels[item.category],
            alt: `${item.title}の制作実績サムネイル`
        }, item);
    });

    const variantWorkIds = function () {
        const variant = window.DOGAZUKURI_VARIANT;
        if (!variant || !Array.isArray(variant.workIds)) return null;

        const ids = variant.workIds.filter(Boolean);
        return new Set(ids);
    };

    const visibleWorkItems = function () {
        const ids = variantWorkIds();
        if (!ids) return workItems;
        return workItems.filter(function (item) {
            return ids.has(item.id);
        });
    };

    const siteNav = document.getElementById('siteNav');
    const navToggle = document.getElementById('siteNavToggle');
    const navLinks = document.getElementById('siteNavLinks');
    const revealTargets = document.querySelectorAll('.scroll-reveal');
    const countTargets = document.querySelectorAll('.count-up');
    const heroSequence = document.querySelector('.hero-sequence');
    const worksWallMosaic = document.getElementById('worksWallMosaic');
    const workGrid = document.getElementById('workGrid');
    const workFilters = document.getElementById('workFilters');
    const loadMoreButton = document.getElementById('loadMoreWorks');
    const worksSection = document.getElementById('works');
    const mobileStickyCta = document.querySelector('.mobile-sticky-cta');
    const mobileViewport = window.matchMedia('(max-width: 760px)');
    const initialVisibleCount = 24;
    let activeFilter = 'all';
    let visibleCount = initialVisibleCount;

    const updateNavState = function () {
        if (!siteNav) return;
        siteNav.classList.toggle('site-nav--scrolled', window.scrollY > 24);
    };

    const closeNav = function () {
        document.body.classList.remove('nav-open');
        if (navToggle) {
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.setAttribute('aria-label', 'メニューを開く');
        }
    };

    const openNav = function () {
        document.body.classList.add('nav-open');
        if (navToggle) {
            navToggle.setAttribute('aria-expanded', 'true');
            navToggle.setAttribute('aria-label', 'メニューを閉じる');
        }
    };

    const revealImmediately = function () {
        revealTargets.forEach(function (el) {
            el.classList.add('revealed');
        });
    };

    const initReveal = function () {
        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            revealImmediately();
            return;
        }

        const observer = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    obs.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -48px 0px'
        });

        revealTargets.forEach(function (el) {
            observer.observe(el);
        });
    };

    const animateCount = function (el) {
        const target = Number(el.dataset.count || el.textContent || 0);
        if (!target || el.dataset.counted === 'true') return;
        el.dataset.counted = 'true';

        if (prefersReducedMotion) {
            el.textContent = String(target);
            return;
        }

        const duration = 900;
        const start = performance.now();

        const tick = function (now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = String(Math.round(target * eased));
            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                el.textContent = String(target);
            }
        };

        requestAnimationFrame(tick);
    };

    const initCountUp = function () {
        if (!countTargets.length) return;
        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            countTargets.forEach(animateCount);
            return;
        }

        const observer = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animateCount(entry.target);
                    obs.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.45
        });

        countTargets.forEach(function (el) {
            observer.observe(el);
        });
    };

    const createImage = function (item, loading) {
        const picture = document.createElement('picture');
        const source = document.createElement('source');
        source.type = 'image/webp';
        source.srcset = item.image.replace(/\.jpg$/, '.webp');
        picture.appendChild(source);

        const img = document.createElement('img');
        img.src = item.image;
        img.alt = item.alt;
        img.width = item.aspect === 'short' ? 1080 : 1280;
        img.height = item.aspect === 'short' ? 1920 : 720;
        img.loading = loading || 'lazy';
        picture.appendChild(img);
        return picture;
    };

    const renderWorksWall = function () {
        if (!worksWallMosaic) return;
        worksWallMosaic.replaceChildren();
        visibleWorkItems().forEach(function (item) {
            const tile = document.createElement('div');
            tile.className = `works-wall__tile works-wall__tile--${item.aspect}`;
            tile.appendChild(createImage(item, 'lazy'));
            worksWallMosaic.appendChild(tile);
        });
    };

    const filteredWorks = function () {
        const items = visibleWorkItems();
        if (activeFilter === 'all') return items;
        return items.filter(function (item) {
            if (activeFilter === 'sns') {
                return item.aspect === 'short';
            }
            return item.category === activeFilter;
        });
    };

    const renderWorks = function () {
        if (!workGrid) return;
        const items = filteredWorks();
        const visibleItems = items.slice(0, visibleCount);
        workGrid.replaceChildren();

        visibleItems.forEach(function (item) {
            const card = document.createElement('a');
            card.className = `work-card work-card--${item.aspect}`;
            card.href = item.url;
            card.target = '_blank';
            card.rel = 'noopener';

            const thumb = document.createElement('div');
            thumb.className = `work-thumb work-thumb--${item.aspect}`;
            thumb.appendChild(createImage(item));
            const play = document.createElement('span');
            play.className = 'work-play';
            play.setAttribute('aria-hidden', 'true');
            play.textContent = '▶';
            thumb.appendChild(play);

            const body = document.createElement('div');
            body.className = 'work-body';
            const title = document.createElement('h3');
            title.textContent = item.title;
            const category = document.createElement('span');
            category.className = 'work-category';
            category.textContent = item.categoryLabel;
            body.append(title, category);

            card.append(thumb, body);
            workGrid.appendChild(card);
        });

        if (loadMoreButton) {
            const hasMore = items.length > visibleCount;
            loadMoreButton.hidden = !hasMore;
            loadMoreButton.style.display = hasMore ? '' : 'none';
        }
    };

    const initWorks = function () {
        renderWorksWall();
        renderWorks();

        if (workFilters) {
            workFilters.addEventListener('click', function (event) {
                const button = event.target.closest('[data-filter]');
                if (!button) return;
                activeFilter = button.dataset.filter || 'all';
                visibleCount = initialVisibleCount;
                workFilters.querySelectorAll('.filter-button').forEach(function (filterButton) {
                    filterButton.classList.toggle('is-active', filterButton === button);
                });
                renderWorks();
            });
        }

        if (loadMoreButton) {
            loadMoreButton.addEventListener('click', function () {
                visibleCount += 16;
                renderWorks();
            });
        }
    };

    const initNav = function () {
        window.addEventListener('scroll', updateNavState, { passive: true });
        updateNavState();

        if (navToggle && navLinks) {
            navToggle.addEventListener('click', function () {
                if (document.body.classList.contains('nav-open')) {
                    closeNav();
                } else {
                    openNav();
                }
            });

            navLinks.querySelectorAll('a').forEach(function (link) {
                link.addEventListener('click', closeNav);
            });

            document.addEventListener('keydown', function (event) {
                if (event.key === 'Escape' && document.body.classList.contains('nav-open')) {
                    closeNav();
                    navToggle.focus();
                }
            });
        }
    };

    const initSmoothAnchors = function () {
        document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
            anchor.addEventListener('click', function (event) {
                const href = anchor.getAttribute('href');
                if (!href || href === '#') return;
                const target = document.querySelector(href);
                if (!target) return;

                event.preventDefault();
                const navHeight = siteNav ? siteNav.getBoundingClientRect().height : 0;
                const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 10;
                window.scrollTo({
                    top: top,
                    behavior: prefersReducedMotion ? 'auto' : 'smooth'
                });

                if (target instanceof HTMLElement) {
                    const previousTabIndex = target.getAttribute('tabindex');
                    target.setAttribute('tabindex', '-1');
                    target.focus({ preventScroll: true });
                    if (previousTabIndex === null) {
                        target.addEventListener('blur', function handler() {
                            target.removeAttribute('tabindex');
                            target.removeEventListener('blur', handler);
                        });
                    }
                }
            });
        });
    };

    const updateStickyCtaState = function () {
        if (!mobileStickyCta || !worksSection) return;
        if (!mobileViewport.matches) {
            mobileStickyCta.classList.remove('mobile-sticky-cta--hidden');
            return;
        }

        const rect = worksSection.getBoundingClientRect();
        const worksVisible = rect.top < window.innerHeight && rect.bottom > 0;
        const heroRect = heroSequence ? heroSequence.getBoundingClientRect() : null;
        const heroVisible = heroRect && heroRect.top < window.innerHeight && heroRect.bottom > 0;
        mobileStickyCta.classList.toggle('mobile-sticky-cta--hidden', worksVisible || heroVisible);
    };

    const initStickyCta = function () {
        updateStickyCtaState();
        window.addEventListener('scroll', updateStickyCtaState, { passive: true });
        window.addEventListener('resize', updateStickyCtaState);
    };

    document.addEventListener('DOMContentLoaded', function () {
        initNav();
        initReveal();
        initCountUp();
        initWorks();
        initSmoothAnchors();
        initStickyCta();
    });
})();
