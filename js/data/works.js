/* ==========================================================================
   js/data/works.js (owner: F) — ported verbatim from the old scripts.js.
   DATA IS FACT: do not edit titles / URLs / categories / order here.
   Variant filtering (window.DOGAZUKURI_VARIANT.workIds / workPriorityIds) and the
   aspect-then-priority sort are unchanged. Helpers below are additive.
   ========================================================================== */

export const worksListUrl = 'https://youtube.com/playlist?list=PLB2I6LBVOxi4Pj22zJPSdzmQNFcC7oBZR';
export const categoryLabels = {
    sns: 'SNSショート',
    recruit: '採用・求人',
    pr: '店舗・企業PR',
    school: '医療・学校',
    ai: 'AI映像',
    event: 'イベント・配信'
};
export const workItems = [
    {
        title: 'ビート配達人',
        id: 'ai-beat-delivery',
        image: 'assets/works/ai-beat-delivery.jpg',
        url: 'https://youtu.be/CXVjPOJr_ac',
        category: 'ai',
        categories: ['ai', 'sns'],
        aspect: 'short'
    },
    {
        title: 'ホワイトボード\u200bアニメーション風',
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
        title: '影も踊る夜｜CapCutハッカソン',
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
        title: '星丘公園 / Hump Back（ベースカバー）',
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
        title: '月灯フィナンシェ',
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
        title: 'Amazon商品\u200b使用方法解説',
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
        title: 'ホワイトニング\u200b商品紹介 01',
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
        title: '美容クリニック\u200b紹介',
        image: 'assets/works/work-short-17.jpg',
        url: 'https://www.tiktok.com/@gakuennmaewellnessclinic/video/7489307140901834004',
        category: 'pr',
        aspect: 'short'
    },
    {
        title: 'ホワイトニング\u200b商品紹介 02',
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

export const categoriesFor = function (item) {
    return Array.isArray(item.categories) ? item.categories : (item.category ? [item.category] : []);
};

export const variantWorkIds = function () {
    const variant = window.DOGAZUKURI_VARIANT;
    if (!variant || !Array.isArray(variant.workIds)) return null;

    const ids = variant.workIds.filter(Boolean);
    return new Set(ids);
};

export const visibleWorkItems = function () {
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

export const hasVideoUrl = function (item) {
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



/** Same rule as the old grid: category match, and every 9:16 item also counts as "sns". */
export const filteredWorks = function (activeFilter = 'all') {
    const items = visibleWorkItems();
    if (activeFilter === 'all') return items;
    return items.filter(function (item) {
        return categoriesFor(item).includes(activeFilter) || (activeFilter === 'sns' && item.aspect === 'short');
    });
};

/** Initial number of cards and "もっと見る" increment used by the old grid. */
export const initialVisibleCount = 24;
export const loadMoreStep = 16;

/** Image sources for an item: { webp, fallback, width, height } (webp is null when item.webp === false). */
export const imageSources = function (item) {
    if (!item.image) return null;
    return {
        webp: item.webp !== false && /\.jpg$/.test(item.image) ? item.image.replace(/\.jpg$/, '.webp') : null,
        fallback: item.image,
        width: item.aspect === 'short' ? 1080 : 1280,
        height: item.aspect === 'short' ? 1920 : 720
    };
};

/** Old <picture> builder, kept for convenience. */
export const createImage = function (item, loading) {
    if (!item.image) {
        const placeholder = document.createElement('div');
        placeholder.className = 'work-image-placeholder';
        placeholder.textContent = 'サムネイル準備中';
        placeholder.setAttribute('aria-hidden', 'true');
        return placeholder;
    }
    const src = imageSources(item);
    const picture = document.createElement('picture');
    if (src.webp) {
        const source = document.createElement('source');
        source.type = 'image/webp';
        source.srcset = src.webp;
        picture.appendChild(source);
    }
    const img = document.createElement('img');
    img.src = src.fallback;
    img.alt = item.alt;
    img.width = src.width;
    img.height = src.height;
    img.loading = loading || 'lazy';
    img.decoding = 'async';
    picture.appendChild(img);
    return picture;
};

export const filters = [
    { id: 'all', label: 'すべて' },
    { id: 'sns', label: 'SNSショート' },
    { id: 'recruit', label: '採用・求人' },
    { id: 'pr', label: '店舗・企業PR' },
    { id: 'school', label: '医療・学校' },
    { id: 'ai', label: 'AI映像' },
    { id: 'event', label: 'イベント・配信' }
];
