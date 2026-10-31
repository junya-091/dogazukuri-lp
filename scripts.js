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
            title: 'ショート_ビート配達',
            id: 'ai-beat-delivery',
            image: 'assets/works/ai-beat-delivery.jpg',
            url: 'https://youtu.be/CXVjPOJr_ac',
            category: 'ai',
            categories: ['ai', 'sns'],
            aspect: 'short'
        },
        {
            title: 'ホワイトボードアニメーション風',
            id: 'ai-whiteboard',
            image: 'assets/works/ai-whiteboard.jpg',
            url: 'https://youtu.be/MwvuvXKViIM',
            category: 'ai',
            aspect: 'wide'
        },
        {
            title: '接触誤差',
            id: 'ai-contact-error',
            image: 'assets/works/ai-contact-error.jpg',
            url: 'https://youtu.be/689KBL8jVkg',
            category: 'ai',
            aspect: 'wide'
        },
        {
            title: '乾燥機が止まるまで',
            id: 'ai-laundromat',
            image: 'assets/works/ai-laundromat.jpg',
            url: 'https://youtu.be/YobIW86xPCI',
            category: 'ai',
            aspect: 'wide'
        },
        {
            title: 'おかしなともだち',
            id: 'ai-okashina-tomodachi',
            image: 'assets/works/ai-okashina-tomodachi.jpg',
            webp: false,
            url: 'https://youtu.be/dXMUJbRWLv0',
            category: 'ai',
            aspect: 'wide'
        },
        {
            title: '月曜の憂鬱、踊って飛ばそう💃',
            id: 'ai-monday-dance',
            image: 'assets/works/ai-monday-dance.jpg',
            webp: false,
            url: 'https://youtu.be/ui0d18JvLrM',
            category: 'ai',
            aspect: 'wide'
        },
        {
            title: '既読つけない主義',
            id: 'ai-kidoku',
            image: 'assets/works/ai-kidoku.jpg',
            webp: false,
            url: 'https://youtu.be/CcHoSJJHOQg',
            category: 'ai',
            aspect: 'wide'
        },
        {
            title: '館内では走らないで🌙',
            id: 'ai-kannai',
            image: 'assets/works/ai-kannai.jpg',
            webp: false,
            url: 'https://youtu.be/qMFWEQl3GSY',
            category: 'ai',
            aspect: 'wide'
        },
        {
            title: '【AI戦闘アニメ】紅蓮の魔術師 VS 氷晶の魔導士｜Wan3.0',
            id: 'ai-wan3-battle',
            image: 'assets/works/ai-wan3-battle.jpg',
            webp: false,
            url: 'https://youtu.be/pbDD7CZktT0',
            category: 'ai',
            aspect: 'wide'
        },
        {
            title: '香川県西部をめぐる30秒CM',
            id: 'ai-kagawa-cm',
            image: 'assets/works/ai-kagawa-cm.jpg',
            webp: false,
            url: 'https://youtu.be/feTTRg9m_Js',
            category: 'ai',
            categories: ['ai', 'pr'],
            aspect: 'wide'
        },
        {
            title: '【非公式CM】日本通信SIM「合理的50GBプラン」｜50GB・月額2,178円',
            id: 'ai-sim-cm',
            image: 'assets/works/ai-sim-cm.jpg',
            webp: false,
            url: 'https://youtube.com/shorts/-VnOGsJUFc8',
            category: 'ai',
            categories: ['ai', 'pr', 'sns'],
            aspect: 'short'
        },
        {
            title: '妹×兄Vlog📱',
            id: 'ai-sibling-vlog',
            image: 'assets/works/ai-sibling-vlog.jpg',
            webp: false,
            url: 'https://youtube.com/shorts/X8FRQRTve-U',
            category: 'ai',
            categories: ['ai', 'sns'],
            aspect: 'short'
        },
        {
            title: '《放課後に残された僕らへ》',
            image: 'assets/works/work-wide-01.jpg',
            url: 'https://youtu.be/_PX9zNt_RBM?si=2OZE7c_Oglg2RqLN',
            category: 'ai',
            aspect: 'wide'
        },
        {
            title: '【AIアニメ】可愛い＝正義',
            image: 'assets/works/ai-kawaii.jpg',
            webp: false,
            url: 'https://youtu.be/d0p2AaWFGf0',
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
            title: '影も踊る夜_CapCutハッカソン',
            id: 'ai-shadow-dance',
            image: 'assets/works/ai-shadow-dance.jpg',
            webp: false,
            url: 'https://youtu.be/eP7ILm_4kB0',
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
            title: '10秒CM',
            id: 'ai-ten-sec-cm',
            image: 'assets/works/ai-ten-sec-cm.jpg',
            webp: false,
            url: 'https://youtu.be/YFCQCLu1mfk',
            category: 'ai',
            categories: ['ai', 'pr'],
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
            title: '月灯フィナッシェ',
            id: 'ai-moonlight-financier',
            image: 'assets/works/ai-moonlight-financier.jpg',
            webp: false,
            url: 'https://youtu.be/9-na9SnI3Pg',
            category: 'ai',
            categories: ['ai', 'pr'],
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
            title: 'ショート美容',
            id: 'ai-short-beauty',
            image: 'assets/works/ai-short-beauty.png',
            url: 'https://youtube.com/shorts/fBdeoHmu7kw',
            category: 'ai',
            categories: ['ai', 'sns'],
            aspect: 'short',
            alt: '毛穴トラブルをキャラクターで紹介する美容ショート動画のサムネイル',
            webp: false
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
    ].map(function (item, index) {
        return Object.assign({
            id: item.id || (item.image ? item.image.replace(/^.*\//, '').replace(/\.[^.]+$/, '').replace(/^work-/, '') : `untitled-${index + 1}`),
            url: worksListUrl,
            categories: item.categories || [item.category],
            alt: `${item.title}の制作実績サムネイル`
        }, item);
    });

    const categoriesFor = function (item) {
        return Array.isArray(item.categories) ? item.categories : (item.category ? [item.category] : []);
    };

    const variantWorkIds = function () {
        const variant = window.DOGAZUKURI_VARIANT;
        if (!variant || !Array.isArray(variant.workIds)) return null;

        const ids = variant.workIds.filter(Boolean);
        return new Set(ids);
    };

    const visibleWorkItems = function () {
        const ids = variantWorkIds();
        const items = ids ? workItems.filter(function (item) {
            return ids.has(item.id);
        }) : workItems.slice();
        const configuredPriority = window.DOGAZUKURI_VARIANT && window.DOGAZUKURI_VARIANT.workPriorityIds;
        const priority = Array.isArray(configuredPriority) ? configuredPriority : [];
        const ranks = new Map(priority.map(function (id, index) { return [id, index]; }));
        return items.sort(function (a, b) {
            const aspectOrder = Number(a.aspect === 'short') - Number(b.aspect === 'short');
            if (aspectOrder) return aspectOrder;
            const aRank = ranks.has(a.id) ? ranks.get(a.id) : priority.length;
            const bRank = ranks.has(b.id) ? ranks.get(b.id) : priority.length;
            return aRank - bRank;
        });
    };

    const siteNav = document.getElementById('siteNav');
    const navToggle = document.getElementById('siteNavToggle');
    const navLinks = document.getElementById('siteNavLinks');
    const revealTargets = document.querySelectorAll('.scroll-reveal');
    const countTargets = document.querySelectorAll('.count-up');
    const heroSequence = document.querySelector('.hero-sequence');
    const heroMotionVideo = document.getElementById('heroMotionVideo');
    const heroMotionToggle = document.getElementById('heroMotionToggle');
    const worksWallMosaic = document.getElementById('worksWallMosaic');
    const worksWallToggle = document.getElementById('worksWallToggle');
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

    const initHeroMotion = function () {
        const variant = window.DOGAZUKURI_VARIANT;
        if (!heroMotionVideo || !heroMotionToggle || prefersReducedMotion || !variant || typeof variant.heroMotionAsset !== 'string') return;

        const updateToggleLabel = function () {
            const label = heroMotionVideo.paused ? '背景動画を再生する' : '背景動画を一時停止する';
            heroMotionToggle.textContent = label;
            heroMotionToggle.setAttribute('aria-label', label);
        };

        heroMotionVideo.addEventListener('error', function () {
            heroMotionVideo.pause();
            heroMotionVideo.hidden = true;
            heroMotionVideo.removeAttribute('src');
            heroMotionVideo.load();
            heroMotionToggle.hidden = true;
        }, { once: true });
        heroMotionVideo.addEventListener('play', updateToggleLabel);
        heroMotionVideo.addEventListener('pause', updateToggleLabel);
        heroMotionToggle.addEventListener('click', function () {
            if (heroMotionVideo.paused) {
                const playback = heroMotionVideo.play();
                if (playback && typeof playback.then === 'function') {
                    playback.then(updateToggleLabel).catch(updateToggleLabel);
                } else {
                    updateToggleLabel();
                }
                return;
            }
            heroMotionVideo.pause();
        });

        heroMotionVideo.hidden = false;
        heroMotionToggle.hidden = false;
        heroMotionVideo.src = variant.heroMotionAsset;
        heroMotionVideo.load();
        const playback = heroMotionVideo.play();
        if (playback && typeof playback.then === 'function') {
            playback.then(updateToggleLabel).catch(updateToggleLabel);
        } else {
            updateToggleLabel();
        }
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
        if (!item.image) {
            const placeholder = document.createElement('div');
            placeholder.className = 'work-image-placeholder';
            placeholder.textContent = 'サムネイル準備中';
            placeholder.setAttribute('aria-hidden', 'true');
            return placeholder;
        }

        const picture = document.createElement('picture');
        if (item.webp !== false) {
            const source = document.createElement('source');
            source.type = 'image/webp';
            source.srcset = item.image.replace(/\.jpg$/, '.webp');
            picture.appendChild(source);
        }

        const img = document.createElement('img');
        img.src = item.image;
        img.alt = item.alt;
        img.width = item.aspect === 'short' ? 1080 : 1280;
        img.height = item.aspect === 'short' ? 1920 : 720;
        img.loading = loading || 'lazy';
        img.decoding = 'async';
        picture.appendChild(img);
        return picture;
    };

    const renderWorksWall = function () {
        if (!worksWallMosaic) return;
        worksWallMosaic.replaceChildren();
        const hasVideoUrl = function (item) {
            if (!item.image || !item.url || item.url === worksListUrl) return false;
            try {
                const url = new URL(item.url);
                const host = url.hostname.replace(/^www\./, '');
                if (url.protocol !== 'https:') return false;
                if (host === 'youtu.be') return /^\/[\w-]{11}\/?$/.test(url.pathname);
                if (host === 'youtube.com') return (url.pathname === '/watch' && /^[\w-]{11}$/.test(url.searchParams.get('v') || '')) || /^\/shorts\/[\w-]{11}\/?$/.test(url.pathname);
                if (host === 'tiktok.com') return /^\/@[^/]+\/video\/\d+\/?$/.test(url.pathname);
                if (host === 'instagram.com') return /^\/(?:reel|reels|p)\/[^/]+\/?$/.test(url.pathname);
                return false;
            } catch (_) {
                return false;
            }
        };
        const items = visibleWorkItems().filter(hasVideoUrl);
        const thumbnails = new Map();
        const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
        let paused = false;
        let lastLayout = '';
        let resizeFrame = 0;
        let revision = 0;
        worksWallMosaic.dataset.state = 'loading';

        const loadThumbnail = async function (item, originalOnly) {
            const sources = !originalOnly && item.webp !== false && /\.jpg$/.test(item.image)
                ? [item.image.replace(/\.jpg$/, '.webp'), item.image] : [item.image];
            for (const source of sources) {
                const loaded = await new Promise(function (resolve) {
                    const img = new Image();
                    img.decoding = 'async';
                    img.fetchPriority = 'low';
                    img.onload = function () { resolve(img.naturalWidth > 0 && img.naturalHeight > 0); };
                    img.onerror = function () { resolve(false); };
                    img.src = source;
                });
                if (loaded) return source;
            }
            return null;
        };

        const buildRows = function () {
            const width = worksWallMosaic.clientWidth;
            const height = worksWallMosaic.clientHeight;
            const gap = parseFloat(getComputedStyle(worksWallMosaic).getPropertyValue('--wall-gap')) || 4;
            const layout = `${width}:${height}:${gap}:${revision}`;
            if (!width || !height || layout === lastLayout) return;
            lastLayout = layout;
            const readyItems = items.filter(function (item) { return thumbnails.has(item.id); });
            const wide = readyItems.filter(function (item) { return item.aspect === 'wide'; });
            const short = readyItems.filter(function (item) { return item.aspect === 'short'; });
            const lowerWide = wide.filter(function (_, index) { return index % 2 === 1; });
            const lanes = [
                { aspect: 'wide', items: wide.filter(function (_, index) { return index % 2 === 0; }) },
                { aspect: 'short', items: short },
                { aspect: 'wide', items: lowerWide.length ? lowerWide : wide }
            ];
            const rowHeight = (height - gap * 2) / 3;
            const rows = document.createDocumentFragment();
            lanes.forEach(function (lane, index) {
                const row = document.createElement('div');
                row.className = `works-wall__row works-wall__row--${lane.aspect}`;
                row.dataset.direction = index % 2 ? 'right' : 'left';
                rows.appendChild(row);
                if (!lane.items.length) return;
                const track = document.createElement('div');
                track.className = 'works-wall__track';
                const group = document.createElement('div');
                group.className = 'works-wall__group';
                const tileWidth = rowHeight * (lane.aspect === 'short' ? 9 / 16 : 16 / 9);
                const repeats = Math.max(1, Math.ceil((width + tileWidth) / (lane.items.length * (tileWidth + gap))));
                for (let repeat = 0; repeat < repeats; repeat += 1) {
                    lane.items.forEach(function (item) {
                        const tile = document.createElement('div');
                        tile.className = `works-wall__tile works-wall__tile--${lane.aspect}`;
                        tile.dataset.workId = item.id;
                        const img = document.createElement('img');
                        img.alt = '';
                        img.src = thumbnails.get(item.id);
                        img.width = lane.aspect === 'short' ? 1080 : 1280;
                        img.height = lane.aspect === 'short' ? 1920 : 720;
                        img.decoding = 'async';
                        img.setAttribute('fetchpriority', 'low');
                        tile.appendChild(img);
                        group.appendChild(tile);
                    });
                }
                track.appendChild(group);
                track.appendChild(group.cloneNode(true));
                row.appendChild(track);
            });
            worksWallMosaic.replaceChildren(rows);
            worksWallMosaic.querySelectorAll('.works-wall__track').forEach(function (track) {
                const distance = track.firstElementChild.getBoundingClientRect().width;
                track.style.setProperty('--wall-distance', `${distance}px`);
                track.style.setProperty('--wall-duration', `${distance / 14.4}s`);
            });
        };
        const updateMotion = function () {
            worksWallMosaic.classList.toggle('is-paused', paused || motionPreference.matches);
            if (!worksWallToggle) return;
            worksWallToggle.hidden = motionPreference.matches;
            worksWallToggle.setAttribute('aria-pressed', String(paused));
            worksWallToggle.textContent = paused ? '背景の動きを再開する' : '背景の動きを止める';
        };
        if (worksWallToggle) {
            worksWallToggle.addEventListener('click', function () {
                paused = !paused;
                updateMotion();
            });
        }
        motionPreference.addEventListener('change', updateMotion);
        updateMotion();
        buildRows();
        const scheduleResize = function () {
            cancelAnimationFrame(resizeFrame);
            resizeFrame = requestAnimationFrame(buildRows);
        };
        worksWallMosaic.addEventListener('error', function (event) {
            const tile = event.target.closest && event.target.closest('[data-work-id]');
            if (!tile || !thumbnails.has(tile.dataset.workId)) return;
            const item = items.find(function (candidate) { return candidate.id === tile.dataset.workId; });
            if (!item) return;
            const failedSource = thumbnails.get(item.id);
            thumbnails.delete(item.id);
            worksWallMosaic.dataset.state = thumbnails.size ? 'ready' : 'empty';
            revision += 1;
            scheduleResize();
            if (failedSource !== item.image) {
                loadThumbnail(item, true).then(function (source) {
                    if (!source) return;
                    thumbnails.set(item.id, source);
                    worksWallMosaic.dataset.state = 'ready';
                    revision += 1;
                    scheduleResize();
                });
            }
        }, true);
        Promise.all(items.map(async function (item) {
            const source = await loadThumbnail(item, false);
            if (source) {
                thumbnails.set(item.id, source);
                revision += 1;
                scheduleResize();
            }
        })).then(function () {
            worksWallMosaic.dataset.state = thumbnails.size ? 'ready' : 'empty';
        });
        if ('ResizeObserver' in window) {
            const observer = new ResizeObserver(scheduleResize);
            observer.observe(worksWallMosaic);
        } else {
            window.addEventListener('resize', scheduleResize);
        }
    };

    const filteredWorks = function () {
        const items = visibleWorkItems();
        if (activeFilter === 'all') return items;
        return items.filter(function (item) {
            return categoriesFor(item).includes(activeFilter) || (activeFilter === 'sns' && item.aspect === 'short');
        });
    };

    const renderWorks = function () {
        if (!workGrid) return;
        const items = filteredWorks();
        const visibleItems = items.slice(0, visibleCount);
        workGrid.replaceChildren();
        let shortGroupStarted = false;

        visibleItems.forEach(function (item) {
            const card = document.createElement('a');
            card.className = `work-card work-card--${item.aspect}`;
            if (item.aspect === 'short' && !shortGroupStarted) {
                card.classList.add('work-card--short-start');
                shortGroupStarted = true;
            }
            card.dataset.workId = item.id;
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
            const categories = document.createElement('div');
            categories.className = 'work-categories';
            categoriesFor(item).forEach(function (categoryId) {
                const category = document.createElement('span');
                category.className = 'work-category';
                category.textContent = categoryLabels[categoryId] || categoryId;
                categories.appendChild(category);
            });
            body.append(title, categories);

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
        initHeroMotion();
        initReveal();
        initCountUp();
        initWorks();
        initSmoothAnchors();
        initStickyCta();
    });
})();
