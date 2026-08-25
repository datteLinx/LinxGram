// ==UserScript==
// @name         LinxGram
// @namespace    https://unixgram.com/dashboard
// @version      0.3.2
// @description  
// @author       Noury, Datte
// @match        https://unixgram.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=unixgram.com
// @grant        none
// @run-at        document-end
// ==/UserScript==

(function() {
'use strict';
if (window.__linxGramInjected) {
    return;
}
window.__linxGramInjected = true;

function getRgb(hex) {
    const h = hex.replace('#', '');
    const bigint = parseInt(h, 16);
    return `${(bigint >> 16) & 255}, ${(bigint >> 8) & 255}, ${bigint & 255}`;
}

function lighten(hex, amount) {
    const h = hex.replace('#', '');
    const num = parseInt(h, 16);
    let r = Math.min(255, Math.max(0, (num >> 16) + amount));
    let g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    let b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
}

function applyAccent(hex) {
    const light = lighten(hex, 25);
    const rgb = getRgb(hex);

    let accentStyle = document.getElementById('n-accent-vars');

    if (!accentStyle) {
        accentStyle = document.createElement('style');
        accentStyle.id = 'n-accent-vars';
        document.head.appendChild(accentStyle);
    }

    accentStyle.innerHTML = `
    :root {
        --accent: ${hex} !important;
        --accent-rgb: ${rgb} !important;
        --chat-accent: ${hex} !important;
        --chat-accent-light: ${light} !important;
        --chat-accent-rgb: ${rgb} !important;
        --color-brand: ${hex} !important;
        --color-brand-lt: ${light} !important;
        --primary-color: ${hex} !important;
        --color-sky-400: ${light} !important;
        --color-sky-500: ${hex} !important;
        --color-blue-400: ${light} !important;
        --color-blue-500: ${hex} !important;
    }

    ::selection {
        background: rgba(${rgb}, 0.25) !important;
    }

    .text-sky-400,
    .text-sky-500,
    .text-blue-400,
    .text-blue-500,
    .text-brand,
    .text-brand-lt,
    .hover\\:text-sky-400:hover,
    .hover\\:text-brand-lt:hover {
        color: ${light} !important;
    }

    .bg-sky-400,
    .bg-sky-500,
    .bg-blue-400,
    .bg-blue-500,
    .bg-brand {
        background-color: ${hex} !important;
    }

    .ring-sky-500,
    .ring-brand\\/60 {
        --tw-ring-color: ${hex} !important;
    }

    [style*="rgb(14, 165, 233)"],
    [style*="rgb(56, 189, 248)"],
    [style*="#38bdf8" i],
    [style*="#0ea5e9" i],
    [style*="rgb(109, 95, 196)"],
    [style*="#6d5fc4" i],
    [style*="#b7aaff" i],
    [style*="#8f7dff" i] {
        color: ${light} !important;
    }

    [style*="rgba(14, 165, 233,"],
    [style*="rgba(56, 189, 248,"],
    [style*="rgba(109, 95, 196,"] {
        background-color: rgba(${rgb}, 0.2) !important;
        color: ${light} !important;
    }

    .n-switch.active {
        background: ${hex} !important;
    }

    .n-circle.selected {
        border-color: ${hex} !important;
    }
    `;

    localStorage.setItem('n_accent', hex);
}

function getSavedAccent() {
    return localStorage.getItem('n_accent') || '#E8D4B0';
}

function applyFont(fontClass) {
    document.body.classList.remove('font-pacifico', 'font-bebas', 'font-mono', 'font-minecraft');
    if (fontClass !== 'default') {
        document.body.classList.add(`font-${fontClass}`);
    }
    localStorage.setItem('n_font', fontClass);

    document.querySelectorAll('.n-font-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.font === fontClass);
    });
}

function getSavedFont() {
    return localStorage.getItem('n_font') || 'default';
}

const nStyle = document.createElement('style');

nStyle.innerHTML = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Pacifico&family=Roboto+Mono:wght@400;700&display=swap');
@import url('https://fonts.cdnfonts.com/css/minecraft-4');

body.font-pacifico *:not(svg):not(.lucide):not(i) { font-family: 'Pacifico', cursive !important; }
body.font-bebas *:not(svg):not(.lucide):not(i) { font-family: 'Bebas Neue', sans-serif !important; letter-spacing: 1px !important; }
body.font-mono *:not(svg):not(.lucide):not(i) { font-family: 'Roboto Mono', monospace !important; }
body.font-minecraft *:not(svg):not(.lucide):not(i) { font-family: 'Minecraft', sans-serif !important; letter-spacing: 1px !important; }

.n-font-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
.n-font-btn {
    padding: 8px 12px; background: #232e3c; border: 1px solid #3b4a57; border-radius: 8px;
    color: #ccc; cursor: pointer; font-size: 13px; transition: all 0.2s; flex: 1; text-align: center;
}
.n-font-btn:hover { background: #2b3a47; color: #fff; }
.n-font-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); font-weight: bold; }

.n-panel {
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; height: 100dvh;
    background: #0f0f10; z-index: 999999; display: none;
    color: #fff; overflow-y: auto; overflow-x: hidden;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
.n-panel.open { display: block; }
@media (min-width: 768px) {
    .n-panel {
        top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 420px; height: 85vh; max-height: 800px;
        border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    }
}
.n-header {
    position: sticky; top: 0; z-index: 100;
    height: 56px; min-height: 56px; display: flex; align-items: center; padding: 0 12px;
    background: #0f0f10; border-bottom: 1px solid #1c1c1c;
}

}
.n-back-btn {
    background: none; border: none; color: #fff; cursor: pointer; display: none;
    align-items: center; padding: 8px; border-radius: 50%; transition: background 0.2s;
}
.n-back-btn:hover { background: rgba(255,255,255,0.1); }
.n-back-btn svg { width: 24px; height: 24px; fill: #fff; }
.n-close-btn {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    background: none; border: none; color: #8b8f92; cursor: pointer; padding: 8px; border-radius: 50%;
}
.n-close-btn:hover { background: rgba(255,255,255,0.1); }
.n-close-btn svg { width: 24px; height: 24px; }
.n-header-title { font-size: 17px; font-weight: 600; text-align: center; width: 100%; }

.n-view {
    display: none;
    flex-direction: column;
    padding-bottom: 20px;
}
.n-view.active { display: flex; animation: nSlideIn 0.2s cubic-bezier(0.25, 0.1, 0.25, 1); }
@keyframes nSlideIn { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }

.n-profile-header {
    display: flex; flex-direction: column; align-items: center; padding: 32px 16px 24px;
    background: #17212b; border-bottom: 1px solid #0e1621;
}
.n-profile-icon {
    width: 80px; height: 80px; border-radius: 50%; background: var(--accent);
    display: flex; align-items: center; justify-content: center; margin-bottom: 12px;
    overflow: hidden;
}
.n-profile-icon img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
.n-profile-name { font-size: 20px; font-weight: 600; }
.n-profile-status { font-size: 14px; color: #8b8f92; margin-top: 4px; }

.n-category-title {
    font-size: 13px; font-weight: 500; color: #8b8f92; padding: 12px 12px 6px;
}
}
.n-container {
    background: #141414;
    border-radius: 16px !important;
    margin: 0 8px 8px;
    overflow: hidden;
}
.n-container .n-item:first-child {
    border-top-left-radius: 16px !important;
    border-top-right-radius: 16px !important;
}
.n-container .n-item:last-child {
    border-bottom-left-radius: 16px !important;
    border-bottom-right-radius: 16px !important;
}
.n-container .n-item:only-child {
    border-radius: 16px !important;
}
.n-item {
    cursor: pointer; padding: 10px 12px; display: flex; align-items: center;
    background: #141414; border-bottom: 1px solid #1c1c1c; transition: background 0.2s;
}
.n-item:last-child { border-bottom: none; }
.n-item:hover { background: #1a1a1a; }
.n-item-content { display: flex; justify-content: space-between; align-items: center; width: 100%; }
.n-text-block { display: flex; flex-direction: column; gap: 1px; flex: 1; padding-right: 12px; }
.n-item-title { color: #fff; font-size: 15px; font-weight: 400; }
.n-item-desc { color: #8b8f92; font-size: 12px; }
.n-chevron { color: #8b8f92; opacity: 0.6; flex-shrink: 0; }
.n-chevron svg { width: 20px; height: 20px; }

.n-settings { padding: 16px; background: #141414; margin: 0 8px; border-radius: 12px; margin-bottom: 8px; }
.n-switch {
    position: relative; width: 36px; height: 20px; background: #3b4a57;
    border-radius: 10px; cursor: pointer; transition: background 0.3s; flex-shrink: 0;
}
.n-switch::after {
    content: ''; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px;
    background: #fff; border-radius: 50%; transition: transform 0.3s ease;
}
.n-switch.active { background: var(--accent); }
.n-switch.active::after { transform: translateX(16px); }

.n-colored-nick {
    background-clip: text !important; -webkit-background-clip: text !important;
    color: transparent !important; -webkit-text-fill-color: transparent !important;
    background-size: 200% auto !important; animation: nGradientShift 3s linear infinite !important;
}
@keyframes nGradientShift { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }

.n-avatar-icon {
    width: 20px; height: 20px; border-radius: 6px; object-fit: cover; margin-left: 2px;
    vertical-align: middle; display: inline-block; border: 1px solid rgba(255,255,255,0.2);
}
.n-fake-star { width: 16px; height: 16px; margin-left: 2px; vertical-align: middle; display: inline-block; flex-shrink: 0; }

.n-text-input {
    width: 100%; height: 44px; padding: 0 12px; border: 1px solid #0e1621;
    border-radius: 10px; outline: none; background: #17212b; color: #fff;
    font-family: inherit; font-size: 15px; box-sizing: border-box; margin-bottom: 12px;
}
.n-text-input:focus { border-color: var(--accent); }

.n-color-row { display: flex; gap: 12px; align-items: center; }
.n-color-row input[type="color"], #accentPicker {
    width: 40px; height: 40px; padding: 0; border: 1px solid #3b4a57;
    border-radius: 8px; background: transparent; overflow: hidden; cursor: pointer;
}
.n-color-row input[type="color"]::-webkit-color-swatch-wrapper, #accentPicker::-webkit-color-swatch-wrapper { padding: 2px; }
.n-color-row input[type="color"]::-webkit-color-swatch, #accentPicker::-webkit-color-swatch { border: 0; border-radius: 6px; }

.n-palette { display: flex; gap: 12px; margin-top: 0; flex-wrap: wrap; }
.n-circle {
    width: 32px; height: 32px; border-radius: 50%; cursor: pointer;
    border: 2px solid transparent; transition: transform 0.2s, border-color 0.2s;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.n-circle:hover { transform: scale(1.1); }
.n-circle.selected { border-color: #fff; transform: scale(1.1); }
.n-add-circle { background: #232e3c; color: #fff; }
.n-add-circle svg { width: 16px; height: 16px; }
#n-bg-preview { width: 60px; height: 40px; object-fit: cover; border-radius: 6px; border: 1px solid #3b4a57; background: #000; flex-shrink: 0; }

.n-url-bg {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.7); z-index: 999998; display: none;
    align-items: center; justify-content: center;
}
.n-url-bg.open { display: flex; }
.n-url-menu { background: #1c2733; padding: 20px; border-radius: 12px; width: 320px; box-sizing: border-box; color: #fff; }
.n-url-input {
    background: #17212b; border: 1px solid #0e1621; border-radius: 10px;
    padding: 12px; color: #ccc; margin-bottom: 15px; outline: none; font-size: 15px; width: 100%; box-sizing: border-box;
}
.n-url-input:focus { border-color: var(--accent); }
.n-url-btn {
    background: var(--accent); color: #fff; border: none; border-radius: 10px;
    padding: 12px; font-weight: 600; cursor: pointer; width: 100%; font-size: 15px;
}

html.n-bg-active { --tg-bg: transparent !important; }
html.n-bg-active body { background: none !important; }
html.n-bg-active body > #n-nft-bg { display: block !important; }
#n-nft-bg { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: -1; pointer-events: none; overflow: hidden; display: none; }
#n-nft-bg > div { position: absolute; inset: 0; overflow: hidden; border-radius: inherit; }
#n-nft-bg canvas { position: relative; height: 100% !important; width: 100% !important; object-fit: cover; opacity: 0.2; }

#n-cub-canvas { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 999990; pointer-events: none; touch-action: none; }

#linx-prof-bg-layer { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-size: cover; background-position: center; background-repeat: no-repeat; z-index: 0; pointer-events: none; }
.px-4.pb-2.pt-4 { position: relative; overflow: hidden; }
.px-4.pb-2.pt-4 > *:not(#linx-prof-bg-layer) { position: relative; z-index: 1; }



nav.mb-\\[max\\(0\\.75rem\\,env\\(safe-area-inset-bottom\\)\\)\\] {
    position: fixed !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    margin-bottom: 0 !important;


    border-radius: 20px 20px 0 0 !important;


    border-top: 0.5px solid rgba(255, 255, 255, 0.1) !important;
    border-left: none !important;
    border-right: none !important;
    border-bottom: none !important;


    background: rgba(20, 20, 20, 0.8) !important;
    backdrop-filter: blur(25px) saturate(180%) !important;
    -webkit-backdrop-filter: blur(25px) saturate(180%) !important;
    box-shadow: 0 -1px 10px rgba(0, 0, 0, 0.3) !important;


    padding-top: 8px !important;
    padding-bottom: calc(8px + env(safe-area-inset-bottom)) !important;
}


nav.mb-\\[max\\(0\\.75rem\\,env\\(safe-area-inset-bottom\\)\\)\\] a span.absolute.inset-0,
nav.mb-\\[max\\(0\\.75rem\\,env\\(safe-area-inset-bottom\\)\\)\\] a.bg-white\\/10 {
    background: transparent !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    border-radius: 0 !important;
}


nav.mb-\\[max\\(0\\.75rem\\,env\\(safe-area-inset-bottom\\)\\)\\] a:active {
    transform: scale(0.85) !important;
    transition: transform 0.1s ease !important;
}


nav.mb-\\[max\\(0\\.75rem\\,env\\(safe-area-inset-bottom\\)\\)\\] svg {
    transition: color 0.15s ease !important;
}

`;

document.head.appendChild(nStyle);

applyAccent(getSavedAccent());
applyFont(getSavedFont());

const dbPromise = new Promise((resolve) => {
    const req = indexedDB.open('LinxGramDB', 1);

    req.onupgradeneeded = e => {
        e.target.result.createObjectStore('images');
    };

    req.onsuccess = e => resolve(e.target.result);
    req.onerror = () => resolve(null);
});

async function saveImage(key, dataUrl) {
    const db = await dbPromise;

    if (!db) return;

    return new Promise(res => {
        const tx = db.transaction('images', 'readwrite');
        tx.objectStore('images').put(dataUrl, key);
        tx.oncomplete = () => res();
        tx.onerror = () => res();
    });
}

async function getImage(key) {
    const db = await dbPromise;

    if (!db) return null;

    return new Promise(res => {
        const tx = db.transaction('images');
        const r = tx.objectStore('images').get(key);

        r.onsuccess = () => res(r.result);
        r.onerror = () => res(null);
    });
}

const nMenuBtn = document.createElement('button');

nMenuBtn.type = 'button';
nMenuBtn.id = 'nMenuBtn';
nMenuBtn.className = 'press relative inline-flex items-center justify-center text-sm transition disabled:cursor-not-allowed disabled:opacity-60 border text-zinc-50 h-9 rounded-full border-zinc-700 bg-transparent px-2.5 font-bold hover:bg-white/5';
nMenuBtn.style.marginLeft = '0';
nMenuBtn.style.marginTop = '8px';
nMenuBtn.style.display = 'inline-flex';
nMenuBtn.style.width = 'fit-content';

nMenuBtn.innerHTML = `
    <span class="inline-flex items-center justify-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layers size-4" aria-hidden="true">
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            <path d="M2 17l10 5 10-5"></path>
            <path d="M2 12l10 5 10-5"></path>
        </svg>
    </span>
`;

nMenuBtn.onclick = () => {
    document.getElementById('nPanel').classList.add('open');
};

const linxProfBgDB = new Promise((resolve) => {
    const req = indexedDB.open('LinxProfBgDB', 1);
    req.onupgradeneeded = e => e.target.result.createObjectStore('bg');
    req.onsuccess = e => resolve(e.target.result);
    req.onerror = () => resolve(null);
});

async function saveProfileBg(dataUrl) {
    const db = await linxProfBgDB;
    if (!db) return;
    return new Promise(res => {
        const tx = db.transaction('bg', 'readwrite');
        tx.objectStore('bg').put(dataUrl, 'profile_bg');
        tx.oncomplete = () => res();
        tx.onerror = () => res();
    });
}

async function getProfileBg() {
    const db = await linxProfBgDB;
    if (!db) return null;
    return new Promise(res => {
        const tx = db.transaction('bg');
        const r = tx.objectStore('bg').get('profile_bg');
        r.onsuccess = () => res(r.result);
        r.onerror = () => res(null);
    });
}

const profBgFileInput = document.createElement('input');
profBgFileInput.type = 'file';
profBgFileInput.accept = 'image/gif, image/png, image/jpeg, image/webp';
profBgFileInput.style.display = 'none';
document.body.appendChild(profBgFileInput);

async function applyProfileBg() {
    const profileRoot = document.querySelector('.px-4.pb-2.pt-4');
    if (!profileRoot) return;

    let bgLayer = document.getElementById('linx-prof-bg-layer');
    if (!bgLayer) {
        bgLayer = document.createElement('div');
        bgLayer.id = 'linx-prof-bg-layer';
        profileRoot.style.position = 'relative';
        profileRoot.style.overflow = 'hidden';
        profileRoot.insertBefore(bgLayer, profileRoot.firstChild);
    }

    const isActive = localStorage.getItem('n_prof_bg_active') === '1';
    const img = await getProfileBg();

    if (isActive && img) {
        bgLayer.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('${img}')`;
        bgLayer.style.display = 'block';
    } else {
        bgLayer.style.display = 'none';
    }
}

const profBgObserver = new MutationObserver(() => {
    applyProfileBg();
});
profBgObserver.observe(document.body, { childList: true, subtree: true });

const nObserver = new MutationObserver(() => {
    const editSpan = Array.from(
        document.querySelectorAll('span.inline-flex.items-center.justify-center.gap-2')
    ).find(el => el.textContent.includes('Редактировать'));

    if (editSpan && !document.getElementById('nMenuBtn')) {
        const parentBtn = editSpan.closest('button') || editSpan;
        const toolbarRow = parentBtn.parentElement || parentBtn;
        toolbarRow.insertAdjacentElement('afterend', nMenuBtn);
    }
});

nObserver.observe(document.body, {
    childList: true,
    subtree: true
});

const nPanel = document.createElement('div');

nPanel.id = 'nPanel';
nPanel.className = 'n-panel';

nPanel.innerHTML = `
    <div class="n-header">
        <button class="n-back-btn" id="nBackBtn">
            <svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></svg>
        </button>
        <div class="n-header-title" id="nHeaderTitle">Настройки</div>
        <button class="n-close-btn" id="nCloseBtn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"></path></svg>
        </button>
    </div>

    <div class="n-view active" data-view="main">
        <div class="n-profile-header">
            <div class="n-profile-icon">
                <img src="https://i.postimg.cc/ZRjssLTp/file-0000000062dc820a8bbbc9a0e6f9f043.png" alt="LinxGram">
            </div>
            <div class="n-profile-name">LinxGram</div>
            <div class="n-profile-status">Модификация UnixGram • v0.3.2</div>
        </div>

        <div class="n-category-title">Внешний вид</div>
        <div class="n-container">
            <div class="n-item" data-target="appearance">
                <div class="n-item-content">
                    <div class="n-text-block"><span class="n-item-title">Внешний вид приложения</span><span class="n-item-desc">Акцент, шрифты, фон</span></div>
                    <div class="n-chevron"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg></div>
                </div>
            </div>
        </div>

        <div class="n-category-title">Персонализация</div>
        <div class="n-container">
            <div class="n-item" data-target="profile">
                <div class="n-item-content">
                    <div class="n-text-block"><span class="n-item-title">Фон профиля</span><span class="n-item-desc">Кастомизация страницы профиля</span></div>
                    <div class="n-chevron"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg></div>
                </div>
            </div>
            <div class="n-item" data-target="nick">
                <div class="n-item-content">
                    <div class="n-text-block"><span class="n-item-title">Ник и эффекты</span><span class="n-item-desc">Цвета, бейджи, звезды</span></div>
                    <div class="n-chevron"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg></div>
                </div>
            </div>
        </div>

        <div class="n-category-title">Дополнительно</div>
        <div class="n-container">
            <div class="n-item" data-target="effects">
                <div class="n-item-content">
                    <div class="n-text-block"><span class="n-item-title">Развлечения и Эффекты</span><span class="n-item-desc">Интерактивные элементы</span></div>
                    <div class="n-chevron"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg></div>
                </div>
            </div>
            <div class="n-item" data-target="system">
                <div class="n-item-content">
                    <div class="n-text-block"><span class="n-item-title">Система</span><span class="n-item-desc">Оптимизация и производительность</span></div>
                    <div class="n-chevron"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg></div>
                </div>
            </div>
        </div>
    </div>

    <div class="n-view" data-view="appearance">
        <div class="n-category-title">Акцент</div>
        <div class="n-container">
            <div class="n-item" style="cursor:default;">
                <div class="n-item-content">
                    <div class="n-text-block"><span class="n-item-title">Акцентный цвет</span><span class="n-item-desc">Цвет акцента по всему приложению</span></div>
                    <input type="color" id="accentPicker" value="${getSavedAccent()}">
                </div>
            </div>
        </div>

        <div class="n-category-title">Шрифты</div>
        <div class="n-settings">
            <div class="n-font-row">
                <button class="n-font-btn" data-font="default">Стандарт</button>
                <button class="n-font-btn" data-font="bebas" style="font-family: 'Bebas Neue';">Bebas</button>
                <button class="n-font-btn" data-font="pacifico" style="font-family: 'Pacifico';">Pacifico</button>
                <button class="n-font-btn" data-font="mono" style="font-family: 'Roboto Mono';">Mono</button>
                <button class="n-font-btn" data-font="minecraft" style="font-family: 'Minecraft';">MC</button>
            </div>
        </div>

        <div class="n-category-title">Фон приложения</div>
        <div class="n-container">
            <div class="n-item" id="bgItem" style="cursor:default;">
                <div class="n-item-content">
                    <div class="n-text-block"><span class="n-item-title">Включить фон</span><span class="n-item-desc">Смена фона всего сайта</span></div>
                    <div class="n-switch" id="bgToggle"></div>
                </div>
            </div>
        </div>
        <div class="n-settings" id="bgSettings">
            <div class="n-palette">
                <div class="n-circle n-add-circle" id="bgUpload" title="Загрузить"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></svg></div>
                <div class="n-circle n-add-circle" id="bgAdd" title="По ссылке"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg></div>
                <div class="n-circle" style="background: #E8455F;" data-color="linear-gradient(rgb(232, 69, 95), rgb(122, 15, 38))"></div>
                <div class="n-circle" style="background: #4D5254;" data-color="linear-gradient(rgb(77, 82, 84), rgb(49, 54, 56))"></div>
                <div class="n-circle" style="background: #00ff00;" data-color="linear-gradient(rgb(0,255,0), rgb(0,100,0))"></div>
                <div class="n-circle" style="background: #4a9eff;" data-color="linear-gradient(rgb(74,158,255), rgb(0,50,100))"></div>
                <img id="n-bg-preview" style="display:none;">
            </div>
            <input type="file" id="bgFileInput" accept="image/png, image/jpeg, image/webp" hidden>
        </div>
    </div>

    <div class="n-view" data-view="profile">
        <div class="n-category-title">Фон профиля</div>
        <div class="n-container">
            <div class="n-item" id="profBgItem" style="cursor:default;">
                <div class="n-item-content">
                    <div class="n-text-block"><span class="n-item-title">Включить фон профиля</span><span class="n-item-desc">Загрузить картинку</span></div>
                    <div class="n-switch" id="profBgToggle"></div>
                </div>
            </div>
        </div>
        <div class="n-settings">
            <div class="n-palette">
                <div class="n-circle n-add-circle" id="profBgUpload" title="Загрузить"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></svg></div>
                <div class="n-circle n-add-circle" id="profBgClear" title="Удалить" style="background: #E8455F; border-color: #E8455F;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></div>
            </div>
        </div>
    </div>

    <div class="n-view" data-view="nick">
        <div class="n-category-title">Никнейм</div>
        <div class="n-settings" style="margin-top:0;">
            <input type="text" class="n-text-input" id="nickInput" placeholder="Ваш никнейм" style="margin-bottom: 0;">
        </div>

        <div class="n-category-title">Эффекты</div>
        <div class="n-container">
            <div class="n-item" id="nickColorItem" style="cursor:default;">
                <div class="n-item-content">
                    <div class="n-text-block"><span class="n-item-title">Цветной ник</span><span class="n-item-desc">Градиентный цвет никнейма</span></div>
                    <div class="n-switch" id="nickToggle"></div>
                </div>
            </div>
        </div>
        <div class="n-settings">
            <div class="n-color-row">
                <input type="color" id="nickColor1" value="#4caf50">
                <input type="color" id="nickColor2" value="#ffffff">
            </div>
        </div>

        <div class="n-container">
            <div class="n-item" id="badgeItem" style="cursor:default;">
                <div class="n-item-content">
                    <div class="n-text-block"><span class="n-item-title">Бейдж</span><span class="n-item-desc">Значок рядом с ником</span></div>
                    <div class="n-switch" id="badgeToggle"></div>
                </div>
            </div>
            <div class="n-item" id="starItem" style="cursor:default;">
                <div class="n-item-content">
                    <div class="n-text-block"><span class="n-item-title">Visual Premium</span><span class="n-item-desc">Звезда рядом с ником</span></div>
                    <div class="n-switch" id="starToggle"></div>
                </div>
            </div>
        </div>
    </div>

    <div class="n-view" data-view="effects">
        <div class="n-category-title">Визуал</div>
        <div class="n-container">
            <div class="n-item" id="cubItem" style="cursor:default;">
                <div class="n-item-content">
                    <div class="n-text-block"><span class="n-item-title">Visual Cub</span><span class="n-item-desc">Интерактивные 2D кубы</span></div>
                    <div class="n-switch" id="cubToggle"></div>
                </div>
            </div>
        </div>
    </div>

    <div class="n-view" data-view="system">
        <div class="n-category-title">Производительность</div>
        <div class="n-container">
            <div class="n-item" id="optItem" style="cursor:default;">
                <div class="n-item-content">
                    <div class="n-text-block"><span class="n-item-title">Optimization</span><span class="n-item-desc">Очистка кэша и ускорение</span></div>
                    <div class="n-switch" id="optToggle"></div>
                </div>
            </div>
        </div>
    </div>
`;
document.body.appendChild(nPanel);

const nUrlPopup = document.createElement('div');
nUrlPopup.id = 'nUrlPopup';
nUrlPopup.className = 'n-url-bg';
nUrlPopup.innerHTML = `
    <div class="n-url-menu">
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 15px;">Сменить фон по ссылке</div>
        <input type="text" class="n-url-input" id="urlInput" placeholder="ссылка...">
        <button class="n-url-btn" id="urlConfirm">Подтвердить</button>
    </div>
`;
document.body.appendChild(nUrlPopup);

nUrlPopup.onclick = function(e) {
    if (e.target === this) {
        this.classList.remove('open');
    }
};

function nShowView(viewName, title) {
    document.querySelectorAll('.n-view').forEach(v => v.classList.remove('active'));
    const targetView = document.querySelector(`.n-view[data-view="${viewName}"]`);
    if(targetView) targetView.classList.add('active');

    document.getElementById('nHeaderTitle').textContent = title;
    document.getElementById('nBackBtn').style.display = (viewName === 'main') ? 'none' : 'flex';
}

function nClosePanel() {
    document.getElementById('nPanel').classList.remove('open');
    setTimeout(() => nShowView('main', 'Настройки'), 200);
}

function saveNickSettings() {
    const s = {
        colorEnabled: document.getElementById('nickToggle').classList.contains('active'),
        badgeEnabled: document.getElementById('badgeToggle').classList.contains('active'),
        starEnabled: document.getElementById('starToggle').classList.contains('active'),
        nick: document.getElementById('nickInput').value.trim(),
        c1: document.getElementById('nickColor1').value,
        c2: document.getElementById('nickColor2').value
    };

    localStorage.setItem('n_nick_settings', JSON.stringify(s));
}

function loadNickSettings() {
    const s = JSON.parse(localStorage.getItem('n_nick_settings') || '{}');

    document.getElementById('nickInput').value = s.nick || '';
    document.getElementById('nickColor1').value = s.c1 || '#4caf50';
    document.getElementById('nickColor2').value = s.c2 || '#ffffff';

    if (s.colorEnabled) {
        document.getElementById('nickToggle').classList.add('active');
    }

    if (s.badgeEnabled) {
        document.getElementById('badgeToggle').classList.add('active');
    }

    if (s.starEnabled) {
        document.getElementById('starToggle').classList.add('active');
    }
}

function starIcon(color) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" class="n-fake-star"><path fill="${color}" fill-rule="evenodd" clip-rule="evenodd" d="m11.466 17.753-4.5 2.758a.994.994 0 0 1-1.483-1.093l.697-2.742a3.448 3.448 0 0 1 1.85-2.26l4.91-2.357a.46.46 0 0 0-.278-.867l-5.465.946a3.831 3.831 0 0 1-3.115-.839L2.355 9.852A.994.994 0 0 1 2.916 8.1l5.276-.413a.994.994 0 0 0 .84-.61l2.035-4.913a.994.994 0 0 1 1.837 0l2.035 4.912a.994.994 0 0 0 .84.61l5.305.416a.994.994 0 0 1 .567 1.747l-4.046 3.449a.994.994 0 0 0-.321.989l1.244 5.166a.994.994 0 0 1-1.486 1.08l-4.537-2.78a.994.994 0 0 0-1.039 0Z"></path></svg>`;
}

function applyNickEffects() {
    const s = JSON.parse(localStorage.getItem('n_nick_settings') || '{}');

    const els = document.querySelectorAll(
        'h2.text-xl.font-extrabold, h2.inline-block.text-xl.font-extrabold, ' +
        'span.text-white.truncate'
    );

    els.forEach(el => {
        if (el.closest('.n-panel') || el.closest('.n-url-menu')) return;

        const isMatch = s.nick && el.textContent.trim() === s.nick;

        if (isMatch && s.colorEnabled) {
            const c1 = s.c1 || '#4caf50';
            const c2 = s.c2 || '#ffffff';

            el.style.background = `linear-gradient(90deg, ${c1}, ${c2}, ${c1})`;
            el.classList.add('n-colored-nick');
        } else {
            if (el.classList.contains('n-colored-nick')) {
                el.classList.remove('n-colored-nick');
                el.style.background = '';
                el.style.color = '';
            }
        }

        const badge = el.parentNode
            ? Array.from(el.parentNode.children).find(
                c => c.classList &&
                c.classList.contains('n-avatar-icon') &&
                c.dataset.linxBadge === 'true'
            )
            : null;

        if (isMatch && s.badgeEnabled) {
            if (!badge) {
                const newBadge = document.createElement('img');

                newBadge.src =
                    'https://i.postimg.cc/ZRjssLTp/file-0000000062dc820a8bbbc9a0e6f9f043.png';

                newBadge.className = 'n-avatar-icon';
                newBadge.dataset.linxBadge = 'true';

                el.after(newBadge);
            }
        } else {
            if (badge) {
                badge.remove();
            }
        }

        const star = el.parentNode
            ? el.parentNode.querySelector('.n-fake-star')
            : null;

        if (isMatch && s.starEnabled) {
            const starColor = s.c1 || '#4caf50';

            if (star) {
                const path = star.querySelector('path');

                if (path) {
                    path.setAttribute('fill', starColor);
                }
            } else {
                el.insertAdjacentHTML('afterend', starIcon(starColor));
            }

            el.dataset.linxStar = 'true';
        } else {
            if (star && el.dataset.linxStar) {
                star.remove();
            }

            delete el.dataset.linxStar;
        }
    });
}

let nickTimer = null;

const nickObs = new MutationObserver(() => {
    clearTimeout(nickTimer);

    nickTimer = setTimeout(() => {
        applyNickEffects();
    }, 100);
});

nickObs.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
});

let cubAct = false;
let cubE = null;
let cubR = null;
let mLoaded = false;
let cubes = [];
let touchCube = null;
let touchOffsetX = 0;
let touchOffsetY = 0;

let actBgColor = 'linear-gradient(rgb(232, 69, 95), rgb(122, 15, 38))';

function showBg() {
    let nBg = document.getElementById('n-nft-bg');

    if (!nBg) {
        nBg = document.createElement('div');
        nBg.id = 'n-nft-bg';
        nBg.innerHTML = '<div></div><canvas width="848" height="554"></canvas>';
        document.body.prepend(nBg);
    }

    nBg.querySelector('div').style.backgroundImage =
        `radial-gradient(circle, rgba(255, 255, 255, 0.267), rgba(255, 255, 255, 0) 9.5rem), ${actBgColor}`;

    nBg.style.display = 'block';
}

let optImgObserver = null;

function lazyLoadImages() {
    document.querySelectorAll('img:not([loading])').forEach(img => {
        img.loading = 'lazy';
        img.decoding = 'async';
    });
}

function applyOptimization(isActive) {
    let optCss = document.getElementById('linx-opt-css');

    if (isActive) {
        if (!optCss) {
            optCss = document.createElement('style');
            optCss.id = 'linx-opt-css';

            optCss.textContent = `
                * {
                    backdrop-filter: none !important;
                    -webkit-backdrop-filter: none !important;
                    transition: none !important;
                    will-change: auto !important;
                }

                [style*="blur"] {
                    filter: none !important;
                    -webkit-filter: none !important;
                }

                .animate-pulse, .animate-spin, [class*="animate-"] {
                    animation: none !important;
                }

                * {
                    box-shadow: none !important;
                }
            `;
            document.head.appendChild(optCss);
        }

        lazyLoadImages();

        if (!optImgObserver) {
            optImgObserver = new MutationObserver(lazyLoadImages);
            optImgObserver.observe(document.body, { childList: true, subtree: true });
        }
    } else {
        if (optCss) optCss.remove();

        if (optImgObserver) {
            optImgObserver.disconnect();
            optImgObserver = null;
        }
    }
}

function initLinxGramEvents() {
    if (document.getElementById('profBgToggle').dataset.bound === 'true') return;

    document.getElementById('profBgToggle').onclick = function(e) {
        e.stopPropagation();
        this.classList.toggle('active');
        const isActive = this.classList.contains('active');
        localStorage.setItem('n_prof_bg_active', isActive ? '1' : '0');
        applyProfileBg();
    };

    document.getElementById('profBgUpload').onclick = function(e) {
        e.stopPropagation();
        profBgFileInput.click();
    };

    profBgFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
            await saveProfileBg(ev.target.result);
            const toggle = document.getElementById('profBgToggle');
            if (!toggle.classList.contains('active')) {
                toggle.classList.add('active');
                localStorage.setItem('n_prof_bg_active', '1');
            }
            applyProfileBg();
        };
        reader.readAsDataURL(file);
    });

    document.getElementById('profBgClear').onclick = async function(e) {
        e.stopPropagation();
        await saveProfileBg('');
        const toggle = document.getElementById('profBgToggle');
        toggle.classList.remove('active');
        localStorage.setItem('n_prof_bg_active', '0');
        applyProfileBg();
    };

    document.getElementById('nBackBtn').addEventListener('click', () => nShowView('main', 'Настройки'));
    document.getElementById('nCloseBtn').addEventListener('click', nClosePanel);

    document.querySelectorAll('.n-item[data-target]').forEach(item => {
        item.addEventListener('click', function(e) {
            if (e.target.classList.contains('n-switch') || e.target.closest('.n-switch') || e.target.classList.contains('n-font-btn') || e.target.closest('.n-font-btn')) {
                return;
            }
            const target = this.dataset.target;
            const title = this.querySelector('.n-item-title').textContent;
            nShowView(target, title);
        });
    });

    document.querySelectorAll('.n-font-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            applyFont(btn.dataset.font);
        });
    });

    document.getElementById('optToggle').onclick = function(e) {
        e.stopPropagation();
        this.classList.toggle('active');
        const isActive = this.classList.contains('active');
        localStorage.setItem('n_opt_active', isActive ? '1' : '0');
        applyOptimization(isActive);
    };

    document.getElementById('accentPicker').addEventListener('input', e => {
        applyAccent(e.target.value);
    });

    document.getElementById('bgToggle').onclick = function(e) {
        e.stopPropagation();
        this.classList.toggle('active');
        const isAct = this.classList.contains('active');
        document.documentElement.classList.toggle('n-bg-active', isAct);
        localStorage.setItem('n_bg_active', isAct ? '1' : '0');
        if (isAct) {
            showBg();
        } else {
            const nBg = document.getElementById('n-nft-bg');
            if (nBg) {
                nBg.style.display = 'none';
            }
        }
    };

    document.querySelectorAll('#bgSettings .n-circle:not(.n-add-circle)').forEach(circle => {
        circle.onclick = function(e) {
            e.stopPropagation();
            document.querySelectorAll('#bgSettings .n-circle').forEach(c => {
                c.classList.remove('selected');
            });
            this.classList.add('selected');
            actBgColor = this.dataset.color;
            localStorage.setItem('n_bg_value', actBgColor);
            localStorage.removeItem('n_bg_image');
            const toggle = document.getElementById('bgToggle');
            if (toggle.classList.contains('active')) {
                showBg();
            }
        };
    });

    document.getElementById('bgAdd').onclick = function(e) {
        e.stopPropagation();
        document.getElementById('nUrlPopup').classList.add('open');
    };

    document.getElementById('urlConfirm').onclick = function() {
        const url = document.getElementById('urlInput').value;
        if (url) {
            actBgColor = `url(${url}) center/cover no-repeat`;
            document.querySelectorAll('#bgSettings .n-circle').forEach(c => {
                c.classList.remove('selected');
            });
            localStorage.setItem('n_bg_value', actBgColor);
            localStorage.removeItem('n_bg_image');
            const toggle = document.getElementById('bgToggle');
            if (!toggle.classList.contains('active')) {
                toggle.classList.add('active');
                document.documentElement.classList.add('n-bg-active');
                localStorage.setItem('n_bg_active', '1');
            }
            showBg();
            document.getElementById('nUrlPopup').classList.remove('open');
        }
    };

    const bgFileInput = document.getElementById('bgFileInput');
    document.getElementById('bgUpload').onclick = function(e) {
        e.stopPropagation();
        bgFileInput.click();
    };

    bgFileInput.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async ev => {
            const dataUrl = ev.target.result;
            await saveImage('n_bg_image', dataUrl);
            actBgColor = `url(${dataUrl}) center/cover no-repeat`;
            document.querySelectorAll('#bgSettings .n-circle').forEach(c => {
                c.classList.remove('selected');
            });
            localStorage.setItem('n_bg_value', 'image');
            const preview = document.getElementById('n-bg-preview');
            preview.src = dataUrl;
            preview.style.display = 'block';
            const toggle = document.getElementById('bgToggle');
            if (!toggle.classList.contains('active')) {
                toggle.classList.add('active');
                document.documentElement.classList.add('n-bg-active');
                localStorage.setItem('n_bg_active', '1');
            }
            showBg();
        };
        reader.readAsDataURL(file);
    });

    document.getElementById('nickToggle').onclick = function(e) {
        e.stopPropagation();
        this.classList.toggle('active');
        saveNickSettings();
        applyNickEffects();
    };

    document.getElementById('badgeToggle').onclick = function(e) {
        e.stopPropagation();
        this.classList.toggle('active');
        saveNickSettings();
        applyNickEffects();
    };

    document.getElementById('starToggle').onclick = function(e) {
        e.stopPropagation();
        this.classList.toggle('active');
        saveNickSettings();
        applyNickEffects();
    };

    document.getElementById('nickInput').addEventListener('input', () => {
        saveNickSettings();
        applyNickEffects();
    });

    document.getElementById('nickColor1').addEventListener('input', () => {
        saveNickSettings();
        applyNickEffects();
    });

    document.getElementById('nickColor2').addEventListener('input', () => {
        saveNickSettings();
        applyNickEffects();
    });

    document.getElementById('cubToggle').onclick = async function(e) {
        e.stopPropagation();
        this.classList.toggle('active');
        cubAct = this.classList.contains('active');

        let canvas = document.getElementById('n-cub-canvas');
        if (cubAct) {
            if (!mLoaded) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js';
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
                mLoaded = true;
            }

            if (!canvas) {
                canvas = document.createElement('canvas');
                canvas.id = 'n-cub-canvas';
                document.body.appendChild(canvas);
            }
            canvas.style.display = 'block';

            const { Engine, Render, World, Bodies, Mouse, MouseConstraint, Body } = Matter;
            cubE = Engine.create();
            cubR = Render.create({
                canvas: canvas, engine: cubE, options: { width: window.innerWidth, height: window.innerHeight, wireframes: false, background: 'transparent' }
            });

            const wallT = 100;
            const ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + wallT / 2, window.innerWidth * 2, wallT, { isStatic: true });
            const ceiling = Bodies.rectangle(window.innerWidth / 2, -wallT / 2, window.innerWidth * 2, wallT, { isStatic: true });
            const leftWall = Bodies.rectangle(-wallT / 2, window.innerHeight / 2, wallT, window.innerHeight * 2, { isStatic: true });
            const rightWall = Bodies.rectangle(window.innerWidth + wallT / 2, window.innerHeight / 2, wallT, window.innerHeight * 2, { isStatic: true });

            cubes = [];
            for (let i = 0; i < 5; i++) {
                const x = window.innerWidth / 2 + (i * 90 - 200);
                const y = 50;
                const size = 80;
                const cube = Bodies.rectangle(x, y, size, size, {
                    restitution: 0.6, friction: 0.1, density: 0.005,
                    render: { sprite: { texture: 'https://i.pinimg.com/736x/cc/43/0d/cc430dc20f7fc149ddc74902c53defcd.jpg', xScale: size / 736, yScale: size / 736 } }
                });
                cubes.push(cube);
            }

            World.add(cubE.world, [ground, ceiling, leftWall, rightWall, ...cubes]);
            const mouse = Mouse.create(canvas);
            const mc = MouseConstraint.create(cubE, { mouse: mouse, constraint: { stiffness: 0.2, render: { visible: false } } });
            World.add(cubE.world, mc);

            let isDragging = false;
            document.addEventListener('mousedown', ev => {
                if (!cubAct) return;
                const mx = ev.clientX, my = ev.clientY;
                const hit = cubes.find(c => mx > c.bounds.min.x && mx < c.bounds.max.x && my > c.bounds.min.y && my < c.bounds.max.y);
                if (hit) { isDragging = true; mouse.mousedown(ev); ev.preventDefault(); }
            });
            document.addEventListener('mousemove', ev => { if (!cubAct || !isDragging) return; mouse.mousemove(ev); ev.preventDefault(); });
            document.addEventListener('mouseup', ev => { if (!isDragging) return; isDragging = false; mouse.mouseup(ev); });

            canvas.addEventListener('touchstart', ev => {
                if (!cubAct || !ev.touches.length) return;
                const touch = ev.touches[0], mx = touch.clientX, my = touch.clientY;
                const hit = cubes.find(c => mx >= c.bounds.min.x && mx <= c.bounds.max.x && my >= c.bounds.min.y && my <= c.bounds.max.y);
                if (!hit) return;
                touchCube = hit; touchOffsetX = hit.position.x - mx; touchOffsetY = hit.position.y - my;
                Body.setVelocity(hit, { x: 0, y: 0 }); Body.setAngularVelocity(hit, 0); ev.preventDefault();
            }, { passive: false });
            canvas.addEventListener('touchmove', ev => {
                if (!cubAct || !touchCube || !ev.touches.length) return;
                const touch = ev.touches[0];
                Body.setPosition(touchCube, { x: touch.clientX + touchOffsetX, y: touch.clientY + touchOffsetY });
                Body.setVelocity(touchCube, { x: 0, y: 0 }); Body.setAngularVelocity(touchCube, 0); ev.preventDefault();
            }, { passive: false });
            canvas.addEventListener('touchend', ev => { if (!touchCube) return; Body.setVelocity(touchCube, { x: 0, y: 0 }); touchCube = null; ev.preventDefault(); }, { passive: false });
            canvas.addEventListener('touchcancel', () => { touchCube = null; }, { passive: false });

            window.addEventListener('resize', () => {
                if (!cubR) return;
                cubR.canvas.width = window.innerWidth; cubR.canvas.height = window.innerHeight;
                cubR.options.width = window.innerWidth; cubR.options.height = window.innerHeight;
            });

            Engine.run(cubE);
            Render.run(cubR);
        } else {
            if (canvas) canvas.style.display = 'none';
            if (cubR) Matter.Render.stop(cubR);
            if (cubE) Matter.Engine.clear(cubE);
            cubes = []; touchCube = null;
        }
    };

    document.getElementById('profBgToggle').dataset.bound = 'true';
}

function restoreSettings() {
    loadNickSettings();
    applyNickEffects();
    applyFont(getSavedFont());

    const optActive = localStorage.getItem('n_opt_active') === '1';
    if (optActive) {
        document.getElementById('optToggle').classList.add('active');
        applyOptimization(true);
    }

    const profBgActive = localStorage.getItem('n_prof_bg_active') === '1';
    if (profBgActive) {
        document.getElementById('profBgToggle').classList.add('active');
        applyProfileBg();
    }

    const bgActive = localStorage.getItem('n_bg_active') === '1';
    const savedValue = localStorage.getItem('n_bg_value');
    getImage('n_bg_image').then(savedImage => {
        if (savedImage) {
            actBgColor = `url(${savedImage}) center/cover no-repeat`;
            const preview = document.getElementById('n-bg-preview');
            preview.src = savedImage;
            preview.style.display = 'block';
        } else if (savedValue && savedValue !== 'image') {
            actBgColor = savedValue;
            document.querySelectorAll('#bgSettings .n-circle:not(.n-add-circle)').forEach(c => {
                if (c.dataset.color === savedValue) c.classList.add('selected');
            });
        }

        if (bgActive) {
            document.getElementById('bgToggle').classList.add('active');
            document.documentElement.classList.add('n-bg-active');
            showBg();
        }
    });
}

setTimeout(() => {
    initLinxGramEvents();
    restoreSettings();
}, 1000);

})();
