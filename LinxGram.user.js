// ==UserScript==
// @name         LinxGram
// @namespace    https://unixgram.com/dashboard
// @version      0.3
// @description  BugFix
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

function получитьRgb(hex) {
    const h = hex.replace('#', '');
    const bigint = parseInt(h, 16);
    return `${(bigint >> 16) & 255}, ${(bigint >> 8) & 255}, ${bigint & 255}`;
}

function осветлить(hex, amount) {
    const h = hex.replace('#', '');
    const num = parseInt(h, 16);
    let r = Math.min(255, Math.max(0, (num >> 16) + amount));
    let g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    let b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
}

function применитьАкцент(hex) {
    const light = осветлить(hex, 25);
    const rgb = получитьRgb(hex);

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

function получитьСохраненныйАкцент() {
    return localStorage.getItem('n_accent') || '#E8D4B0';
}

function применитьШрифт(fontClass) {
    document.body.classList.remove('font-pacifico', 'font-bebas', 'font-mono', 'font-minecraft');
    if (fontClass !== 'default') {
        document.body.classList.add(`font-${fontClass}`);
    }
    localStorage.setItem('n_font', fontClass);

    document.querySelectorAll('.n-font-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.font === fontClass);
    });
}

function получитьСохраненныйШрифт() {
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

.n-font-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 10px;
}
.n-font-btn {
    padding: 8px 12px;
    background: #292a2b;
    border: 1px solid #444;
    border-radius: 8px;
    color: #ccc;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s;
    flex: 1;
    text-align: center;
}
.n-font-btn:hover {
    background: #333;
    color: #fff;
}
.n-font-btn.active {
    background: #fff;
    color: #141414;
    border-color: #fff;
    font-weight: bold;
}

.n-item {
    cursor: pointer;
    transition: background 0.2s;
    position: relative;
}

.n-item:hover {
    background: rgba(255,255,255,0.03);
}

.n-settings {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease-in-out, padding 0.3s ease-in-out;
    padding: 0 16px;
    background: #141414;
}

.n-settings.open {
    max-height: 320px;
    padding: 15px 16px;
}

.n-palette {
    display: flex;
    gap: 10px;
    margin-top: 0;
    flex-wrap: wrap;
}

.n-circle {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid transparent;
    transition: transform 0.2s, border-color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.n-circle:hover {
    transform: scale(1.1);
}

.n-circle.selected {
    border-color: #fff;
    transform: scale(1.1);
}

.n-add-circle {
    background: #333;
    color: #fff;
}

.n-add-circle svg {
    width: 14px;
    height: 14px;
}

.n-url-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.7);
    z-index: 999998;
    display: none;
    align-items: center;
    justify-content: center;
}

.n-url-bg.open {
    display: flex;
}

.n-url-menu {
    background: #1a1a1a;
    padding: 20px;
    border-radius: 20px;
    width: 300px;
    box-sizing: border-box;
    color: #fff;
    border: 1px solid #333;
}

.n-url-input {
    background: transparent;
    border: 1px solid #555;
    border-radius: 10px;
    padding: 10px;
    color: #ccc;
    margin-bottom: 15px;
    outline: none;
    font-size: 14px;
    width: 100%;
    box-sizing: border-box;
}

.n-url-input:focus {
    border-color: #888;
}

.n-url-btn {
    background: #fff;
    color: #141414;
    border: none;
    border-radius: 10px;
    padding: 12px;
    font-weight: bold;
    cursor: pointer;
    width: 100%;
    font-size: 14px;
}

html.n-bg-active {
    --tg-bg: transparent !important;
}

html.n-bg-active body {
    background: none !important;
}

html.n-bg-active body > #n-nft-bg {
    display: block !important;
}

#n-nft-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: -1;
    pointer-events: none;
    overflow: hidden;
    display: none;
}

#n-nft-bg > div {
    position: absolute;
    inset: 0;
    overflow: hidden;
    border-radius: inherit;
}

#n-nft-bg canvas {
    position: relative;
    height: 100% !important;
    width: 100% !important;
    object-fit: cover;
    opacity: 0.2;
}

.n-panel {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    background: #0f0f10;
    z-index: 999999;
    display: none;
    flex-direction: column;
    padding: 20px;
    box-sizing: border-box;
    color: #fff;
    overflow-y: auto;
}

.n-panel.open {
    display: flex;
}

.n-container {
    background: #141414;
    border-radius: 20px;
    overflow: hidden;
    position: relative;
    margin-bottom: 20px;
    flex-shrink: 0;
}

.n-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    padding: 10px 0;
}

.n-back-btn {
    background: none;
    border: none;
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
}

.n-back-btn svg {
    width: 24px;
    height: 24px;
}

.n-item-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 16px;
    box-sizing: border-box;
}

.n-text-block {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    flex: 1;
    padding-right: 12px;
}

.n-item-title {
    color: #fff;
    font-size: 14px;
    font-weight: 500;
}

.n-item-desc {
    color: #666;
    font-size: 10px;
}

.n-switch {
    position: relative;
    width: 40px;
    height: 20px;
    background: #333;
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.3s;
    flex-shrink: 0;
}

.n-switch::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    background: #fff;
    border-radius: 50%;
    transition: transform 0.3s ease;
}

.n-switch.active::after {
    transform: translateX(20px);
}

.n-colored-nick {
    background-clip: text !important;
    -webkit-background-clip: text !important;
    color: transparent !important;
    -webkit-text-fill-color: transparent !important;
    background-size: 200% auto !important;
    animation: nGradientShift 3s linear infinite !important;
}

@keyframes nGradientShift {
    0% {
        background-position: 0% 50%;
    }

    100% {
        background-position: 200% 50%;
    }
}

.n-avatar-icon {
    width: 20px;
    height: 20px;
    border-radius: 6px;
    object-fit: cover;
    margin-left: 2px;
    vertical-align: middle;
    display: inline-block;
    border: 1px solid rgba(255,255,255,0.2);
}

.n-fake-star {
    width: 16px;
    height: 16px;
    margin-left: 2px;
    vertical-align: middle;
    display: inline-block;
    flex-shrink: 0;
}

.n-text-input {
    width: 100%;
    height: 40px;
    padding: 0 12px;
    border: 1px solid #292a2b;
    border-radius: 10px;
    outline: none;
    background: transparent;
    color: #ededed;
    font-family: inherit;
    font-size: 13px;
    box-sizing: border-box;
    margin-bottom: 12px;
}

.n-text-input:focus {
    border-color: #666;
}

.n-color-row {
    display: flex;
    gap: 12px;
    align-items: center;
}

.n-color-row input[type="color"],
#accentPicker {
    width: 32px;
    height: 32px;
    padding: 0;
    border: 1px solid #333;
    border-radius: 8px;
    background: transparent;
    overflow: hidden;
    cursor: pointer;
}

.n-color-row input[type="color"]::-webkit-color-swatch-wrapper,
#accentPicker::-webkit-color-swatch-wrapper {
    padding: 2px;
}

.n-color-row input[type="color"]::-webkit-color-swatch,
#accentPicker::-webkit-color-swatch {
    border: 0;
    border-radius: 6px;
}

#n-bg-preview {
    width: 60px;
    height: 40px;
    object-fit: cover;
    border-radius: 6px;
    border: 1px solid #333;
    background: #000;
    flex-shrink: 0;
}

#n-cub-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 999990;
    pointer-events: none;
    touch-action: none;
}

#linx-prof-bg-layer {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    z-index: 0;
    pointer-events: none;
}

.px-4.pb-2.pt-4 {
    position: relative;
    overflow: hidden;
}

.px-4.pb-2.pt-4 > *:not(#linx-prof-bg-layer) {
    position: relative;
    z-index: 1;
}

.n-category-title {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    color: #666;
    letter-spacing: 0.5px;
    padding: 0 4px 8px;
    margin-top: 24px;
}

.n-category-title:first-of-type {
    margin-top: 0;
}

.n-item-expandable {
    position: relative;
}

.n-item-expandable::after {
    content: '⌄';
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #555;
    font-size: 18px;
    pointer-events: none;
}

.n-item-expandable:has(.n-switch)::after {
    right: 64px;
}
`;

document.head.appendChild(nStyle);

применитьАкцент(получитьСохраненныйАкцент());
применитьШрифт(получитьСохраненныйШрифт());

const dbPromise = new Promise((resolve) => {
    const req = indexedDB.open('LinxGramDB', 1);

    req.onupgradeneeded = e => {
        e.target.result.createObjectStore('images');
    };

    req.onsuccess = e => resolve(e.target.result);
    req.onerror = () => resolve(null);
});

async function сохранитьКартинку(key, dataUrl) {
    const db = await dbPromise;

    if (!db) return;

    return new Promise(res => {
        const tx = db.transaction('images', 'readwrite');
        tx.objectStore('images').put(dataUrl, key);
        tx.oncomplete = () => res();
        tx.onerror = () => res();
    });
}

async function получитьКартинку(key) {
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

async function сохранитьФонПрофиля(dataUrl) {
    const db = await linxProfBgDB;
    if (!db) return;
    return new Promise(res => {
        const tx = db.transaction('bg', 'readwrite');
        tx.objectStore('bg').put(dataUrl, 'profile_bg');
        tx.oncomplete = () => res();
        tx.onerror = () => res();
    });
}

async function получитьФонПрофиля() {
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

async function применитьФонПрофиля() {
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
    const img = await получитьФонПрофиля();

    if (isActive && img) {
        bgLayer.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('${img}')`;
        bgLayer.style.display = 'block';
    } else {
        bgLayer.style.display = 'none';
    }
}

const profBgObserver = new MutationObserver(() => {
    применитьФонПрофиля();
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"></path>
            </svg>
        </button>
    </div>

    <div class="n-category-title">Внешний вид приложения</div>

    <div class="n-container">
        <div class="n-item" id="accentItem" title="Нажмите, чтобы развернуть настройки цвета">
            <div class="n-item-content">
                <div class="n-text-block">
                    <span class="n-item-title">Акцентный цвет <span style="color: #555; font-size: 14px;">⌄</span></span>
                    <span class="n-item-desc">Цвет акцента по всему приложению</span>
                </div>
            </div>
        </div>
        <div class="n-settings open" id="accentSettings">
            <div class="n-palette">
                <input type="color" id="accentPicker" value="${получитьСохраненныйАкцент()}">
            </div>
        </div>
    </div>

    <div class="n-container">
        <div class="n-item" id="fontItem" title="Нажмите, чтобы выбрать шрифт">
            <div class="n-item-content">
                <div class="n-text-block">
                    <span class="n-item-title">Кастомный шрифт <span style="color: #555; font-size: 14px;">⌄</span></span>
                    <span class="n-item-desc">Изменить шрифт во всем приложении</span>
                </div>
            </div>
        </div>
        <div class="n-settings" id="fontSettings">
            <div class="n-font-row">
                <button class="n-font-btn" data-font="default">Стандарт</button>
                <button class="n-font-btn" data-font="bebas" style="font-family: 'Bebas Neue', sans-serif;">Bebas</button>
                <button class="n-font-btn" data-font="pacifico" style="font-family: 'Pacifico', cursive;">Pacifico</button>
                <button class="n-font-btn" data-font="mono" style="font-family: 'Roboto Mono', monospace;">Mono</button>
                <button class="n-font-btn" data-font="minecraft" style="font-family: 'Minecraft', sans-serif;">Minecraft</button>
            </div>
        </div>
    </div>

    <div class="n-container">
        <div class="n-item" id="bgItem" title="Нажмите, чтобы развернуть настройки фона">
            <div class="n-item-content">
                <div class="n-text-block">
                    <span class="n-item-title">Фон приложения <span style="color: #555; font-size: 14px;">⌄</span></span>
                    <span class="n-item-desc">Смена фона всего сайта</span>
                </div>
                <div class="n-switch" id="bgToggle"></div>
            </div>
        </div>
        <div class="n-settings" id="bgSettings">
            <div class="n-palette">
                <div class="n-circle n-add-circle" id="bgUpload" title="Загрузить с устройства">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <path d="M17 8l-5-5-5 5"></path>
                        <path d="M12 3v12"></path>
                    </svg>
                </div>
                <div class="n-circle n-add-circle" id="bgAdd" title="По ссылке">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M5 12h14"></path>
                        <path d="M12 5v14"></path>
                    </svg>
                </div>
                <div class="n-circle" style="background: #E8455F;" data-color="linear-gradient(rgb(232, 69, 95), rgb(122, 15, 38))"></div>
                <div class="n-circle" style="background: #4D5254;" data-color="linear-gradient(rgb(77, 82, 84), rgb(49, 54, 56))"></div>
                <div class="n-circle" style="background: #00ff00;" data-color="linear-gradient(rgb(0,255,0), rgb(0,100,0))"></div>
                <div class="n-circle" style="background: #4a9eff;" data-color="linear-gradient(rgb(74,158,255), rgb(0,50,100))"></div>
                <img id="n-bg-preview" style="display:none;">
            </div>
            <input type="file" id="bgFileInput" accept="image/png, image/jpeg, image/webp" hidden>
        </div>
    </div>

    <div class="n-category-title">Персонализация профиля</div>

    <div class="n-container">
        <div class="n-item" id="profBgItem" title="Нажмите, чтобы загрузить картинку на фон профиля">
            <div class="n-item-content">
                <div class="n-text-block">
                    <span class="n-item-title">Фон профиля <span style="color: #555; font-size: 14px;">⌄</span></span>
                    <span class="n-item-desc">Загрузить картинку</span>
                </div>
                <div class="n-switch" id="profBgToggle"></div>
            </div>
        </div>
        <div class="n-settings" id="profBgSettings">
            <div class="n-palette">
                <div class="n-circle n-add-circle" id="profBgUpload" title="Загрузить с устройства">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <path d="M17 8l-5-5-5 5"></path>
                        <path d="M12 3v12"></path>
                    </svg>
                </div>
                <div class="n-circle n-add-circle" id="profBgClear" title="Удалить фон" style="background: #E8455F; border-color: #E8455F;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </div>
            </div>
        </div>
    </div>

    <div class="n-category-title">Ник</div>

    <div class="n-container">
        <div class="n-item" id="nickInputItem" title="Никнейм, к которому применяются эффекты">
            <div class="n-item-content">
                <div class="n-text-block">
                    <span class="n-item-title">Ввод ника <span style="color: #555; font-size: 14px;">⌄</span></span>
                    <span class="n-item-desc">Никнейм для применения эффектов</span>
                </div>
            </div>
        </div>
        <div class="n-settings open" id="nickInputSettings">
            <input type="text" class="n-text-input" id="nickInput" placeholder="Ваш никнейм" style="margin-bottom: 0;">
        </div>
    </div>

    <div class="n-container">
        <div class="n-item" id="nickColorItem" title="Нажмите, чтобы настроить цвет ника">
            <div class="n-item-content">
                <div class="n-text-block">
                    <span class="n-item-title">Цветной ник <span style="color: #555; font-size: 14px;">⌄</span></span>
                    <span class="n-item-desc">Градиентный цвет никнейма</span>
                </div>
                <div class="n-switch" id="nickToggle"></div>
            </div>
        </div>
        <div class="n-settings" id="nickColorSettings">
            <div class="n-color-row">
                <input type="color" id="nickColor1" value="#4caf50">
                <input type="color" id="nickColor2" value="#ffffff">
            </div>
        </div>
    </div>

    <div class="n-container">
        <div class="n-item" id="badgeItem" title="Включить значок рядом с ником">
            <div class="n-item-content">
                <div class="n-text-block">
                    <span class="n-item-title">Бейдж</span>
                    <span class="n-item-desc">Значок рядом с ником</span>
                </div>
                <div class="n-switch" id="badgeToggle"></div>
            </div>
        </div>
    </div>

    <div class="n-container">
        <div class="n-item" id="starItem" title="Включить звезду рядом с ником">
            <div class="n-item-content">
                <div class="n-text-block">
                    <span class="n-item-title">Visual Premium</span>
                    <span class="n-item-desc">Звезда рядом с ником</span>
                </div>
                <div class="n-switch" id="starToggle"></div>
            </div>
        </div>
    </div>

    <div class="n-category-title">Развлечения и Эффекты</div>

    <div class="n-container">
        <div class="n-item" id="cubItem" title="Включить интерактивные кубы">
            <div class="n-item-content">
                <div class="n-text-block">
                    <span class="n-item-title">Visual Cub</span>
                    <span class="n-item-desc">Интерактивные 2D кубы</span>
                </div>
                <div class="n-switch" id="cubToggle"></div>
            </div>
        </div>
    </div>

    <div class="n-category-title">Система</div>

    <div class="n-container">
        <div class="n-item" id="optItem" title="Включить оптимизацию страницы">
            <div class="n-item-content">
                <div class="n-text-block">
                    <span class="n-item-title">Optimization</span>
                    <span class="n-item-desc">Очистка кэша и ускорение</span>
                </div>
                <div class="n-switch" id="optToggle"></div>
            </div>
        </div>
    </div>
`;
document.body.appendChild(nPanel);

document.getElementById('profBgToggle').onclick = function(e) {
    e.stopPropagation();
    this.classList.toggle('active');
    const isActive = this.classList.contains('active');
    localStorage.setItem('n_prof_bg_active', isActive ? '1' : '0');
    применитьФонПрофиля();
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
        await сохранитьФонПрофиля(ev.target.result);
        const toggle = document.getElementById('profBgToggle');
        if (!toggle.classList.contains('active')) {
            toggle.classList.add('active');
            localStorage.setItem('n_prof_bg_active', '1');
        }
        применитьФонПрофиля();
    };
    reader.readAsDataURL(file);
});

document.getElementById('profBgClear').onclick = async function(e) {
    e.stopPropagation();
    await сохранитьФонПрофиля('');
    const toggle = document.getElementById('profBgToggle');
    toggle.classList.remove('active');
    localStorage.setItem('n_prof_bg_active', '0');
    применитьФонПрофиля();
};

document.getElementById('nBackBtn').addEventListener('click', () => {
    nPanel.classList.remove('open');
});

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

document.querySelectorAll('.n-item').forEach(item => {
    item.addEventListener('click', function(e) {
        if (e.target.classList.contains('n-switch') || e.target.closest('.n-switch') || e.target.classList.contains('n-font-btn')) {
            return;
        }

        const next = this.nextElementSibling;

        if (next && next.classList.contains('n-settings')) {
            next.classList.toggle('open');
        }
    });
});

document.querySelectorAll('.n-font-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        применитьШрифт(btn.dataset.font);
    });
});

let optImgObserver = null;

function лениваяЗагрузкаКартинок() {
    document.querySelectorAll('img:not([loading])').forEach(img => {
        img.loading = 'lazy';
        img.decoding = 'async';
    });
}

function применитьОптимизацию(isActive) {
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

        лениваяЗагрузкаКартинок();

        if (!optImgObserver) {
            optImgObserver = new MutationObserver(лениваяЗагрузкаКартинок);
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

document.getElementById('optToggle').onclick = function(e) {
    e.stopPropagation();
    this.classList.toggle('active');
    const isActive = this.classList.contains('active');
    localStorage.setItem('n_opt_active', isActive ? '1' : '0');
    применитьОптимизацию(isActive);
};

document.getElementById('accentPicker').addEventListener('input', e => {
    применитьАкцент(e.target.value);
});

let actBgColor = 'linear-gradient(rgb(232, 69, 95), rgb(122, 15, 38))';

function показатьФон() {
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

document.getElementById('bgToggle').onclick = function(e) {
    e.stopPropagation();

    this.classList.toggle('active');

    const isAct = this.classList.contains('active');

    document.documentElement.classList.toggle('n-bg-active', isAct);

    localStorage.setItem('n_bg_active', isAct ? '1' : '0');

    if (isAct) {
        показатьФон();
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
            показатьФон();
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

        показатьФон();

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

        await сохранитьКартинку('n_bg_image', dataUrl);

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

        показатьФон();
    };

    reader.readAsDataURL(file);
});

document.getElementById('nickToggle').onclick = function(e) {
    e.stopPropagation();
    this.classList.toggle('active');
    сохранитьНастройкиНика();
    применитьЭффектыНика();
};

document.getElementById('badgeToggle').onclick = function(e) {
    e.stopPropagation();
    this.classList.toggle('active');
    сохранитьНастройкиНика();
    применитьЭффектыНика();
};

document.getElementById('starToggle').onclick = function(e) {
    e.stopPropagation();
    this.classList.toggle('active');
    сохранитьНастройкиНика();
    применитьЭффектыНика();
};

document.getElementById('nickInput').addEventListener('input', () => {
    сохранитьНастройкиНика();
    применитьЭффектыНика();
});

document.getElementById('nickColor1').addEventListener('input', () => {
    сохранитьНастройкиНика();
    применитьЭффектыНика();
});

document.getElementById('nickColor2').addEventListener('input', () => {
    сохранитьНастройкиНика();
    применитьЭффектыНика();
});

function сохранитьНастройкиНика() {
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

function загрузитьНастройкиНика() {
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

function иконкаЗвезды(color) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" class="n-fake-star"><path fill="${color}" fill-rule="evenodd" clip-rule="evenodd" d="m11.466 17.753-4.5 2.758a.994.994 0 0 1-1.483-1.093l.697-2.742a3.448 3.448 0 0 1 1.85-2.26l4.91-2.357a.46.46 0 0 0-.278-.867l-5.465.946a3.831 3.831 0 0 1-3.115-.839L2.355 9.852A.994.994 0 0 1 2.916 8.1l5.276-.413a.994.994 0 0 0 .84-.61l2.035-4.913a.994.994 0 0 1 1.837 0l2.035 4.912a.994.994 0 0 0 .84.61l5.305.416a.994.994 0 0 1 .567 1.747l-4.046 3.449a.994.994 0 0 0-.321.989l1.244 5.166a.994.994 0 0 1-1.486 1.08l-4.537-2.78a.994.994 0 0 0-1.039 0Z"></path></svg>`;
}

function применитьЭффектыНика() {
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
                el.insertAdjacentHTML('afterend', иконкаЗвезды(starColor));
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
        применитьЭффектыНика();
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

document.getElementById('cubToggle').onclick = async function(e) {
    e.stopPropagation();

    this.classList.toggle('active');
    cubAct = this.classList.contains('active');

    let canvas = document.getElementById('n-cub-canvas');

    if (cubAct) {
        if (!mLoaded) {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');

                script.src =
                    'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js';

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

        const {
            Engine,
            Render,
            World,
            Bodies,
            Mouse,
            MouseConstraint,
            Body
        } = Matter;

        cubE = Engine.create();

        cubR = Render.create({
            canvas: canvas,
            engine: cubE,
            options: {
                width: window.innerWidth,
                height: window.innerHeight,
                wireframes: false,
                background: 'transparent'
            }
        });

        const wallT = 100;

        const ground = Bodies.rectangle(
            window.innerWidth / 2,
            window.innerHeight + wallT / 2,
            window.innerWidth * 2,
            wallT,
            { isStatic: true }
        );

        const ceiling = Bodies.rectangle(
            window.innerWidth / 2,
            -wallT / 2,
            window.innerWidth * 2,
            wallT,
            { isStatic: true }
        );

        const leftWall = Bodies.rectangle(
            -wallT / 2,
            window.innerHeight / 2,
            wallT,
            window.innerHeight * 2,
            { isStatic: true }
        );

        const rightWall = Bodies.rectangle(
            window.innerWidth + wallT / 2,
            window.innerHeight / 2,
            wallT,
            window.innerHeight * 2,
            { isStatic: true }
        );

        cubes = [];

        for (let i = 0; i < 5; i++) {
            const x = window.innerWidth / 2 + (i * 90 - 200);
            const y = 50;
            const size = 80;

            const cube = Bodies.rectangle(
                x,
                y,
                size,
                size,
                {
                    restitution: 0.6,
                    friction: 0.1,
                    density: 0.005,
                    render: {
                        sprite: {
                            texture: 'https://i.pinimg.com/736x/cc/43/0d/cc430dc20f7fc149ddc74902c53defcd.jpg',
                            xScale: size / 736,
                            yScale: size / 736
                        }
                    }
                }
            );

            cubes.push(cube);
        }

        World.add(cubE.world, [
            ground,
            ceiling,
            leftWall,
            rightWall,
            ...cubes
        ]);

        const mouse = Mouse.create(canvas);

        const mc = MouseConstraint.create(cubE, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });

        World.add(cubE.world, mc);

        let isDragging = false;

        document.addEventListener('mousedown', ev => {
            if (!cubAct) return;

            const mx = ev.clientX;
            const my = ev.clientY;

            const hit = cubes.find(c =>
                mx > c.bounds.min.x &&
                mx < c.bounds.max.x &&
                my > c.bounds.min.y &&
                my < c.bounds.max.y
            );

            if (hit) {
                isDragging = true;
                mouse.mousedown(ev);
                ev.preventDefault();
            }
        });

        document.addEventListener('mousemove', ev => {
            if (!cubAct || !isDragging) return;

            mouse.mousemove(ev);
            ev.preventDefault();
        });

        document.addEventListener('mouseup', ev => {
            if (!isDragging) return;

            isDragging = false;
            mouse.mouseup(ev);
        });

        canvas.addEventListener('touchstart', ev => {
            if (!cubAct || !ev.touches.length) return;

            const touch = ev.touches[0];
            const mx = touch.clientX;
            const my = touch.clientY;

            const hit = cubes.find(c =>
                mx >= c.bounds.min.x &&
                mx <= c.bounds.max.x &&
                my >= c.bounds.min.y &&
                my <= c.bounds.max.y
            );

            if (!hit) return;

            touchCube = hit;
            touchOffsetX = hit.position.x - mx;
            touchOffsetY = hit.position.y - my;

            Body.setVelocity(hit, {
                x: 0,
                y: 0
            });

            Body.setAngularVelocity(hit, 0);

            ev.preventDefault();
        }, { passive: false });

        canvas.addEventListener('touchmove', ev => {
            if (!cubAct || !touchCube || !ev.touches.length) return;

            const touch = ev.touches[0];

            Body.setPosition(touchCube, {
                x: touch.clientX + touchOffsetX,
                y: touch.clientY + touchOffsetY
            });

            Body.setVelocity(touchCube, {
                x: 0,
                y: 0
            });

            Body.setAngularVelocity(touchCube, 0);

            ev.preventDefault();
        }, { passive: false });

        canvas.addEventListener('touchend', ev => {
            if (!touchCube) return;

            Body.setVelocity(touchCube, {
                x: 0,
                y: 0
            });

            touchCube = null;
            ev.preventDefault();
        }, { passive: false });

        canvas.addEventListener('touchcancel', () => {
            touchCube = null;
        }, { passive: false });

        window.addEventListener('resize', () => {
            if (!cubR) return;

            cubR.canvas.width = window.innerWidth;
            cubR.canvas.height = window.innerHeight;
            cubR.options.width = window.innerWidth;
            cubR.options.height = window.innerHeight;
        });

        Engine.run(cubE);
        Render.run(cubR);

    } else {
        if (canvas) {
            canvas.style.display = 'none';
        }

        if (cubR) {
            Matter.Render.stop(cubR);
        }

        if (cubE) {
            Matter.Engine.clear(cubE);
        }

        cubes = [];
        touchCube = null;
    }
};

async function восстановитьСостояние() {
    загрузитьНастройкиНика();
    применитьЭффектыНика();
    применитьШрифт(получитьСохраненныйШрифт());

    const optActive = localStorage.getItem('n_opt_active') === '1';
    if (optActive) {
        document.getElementById('optToggle').classList.add('active');
        применитьОптимизацию(true);
    }

    const profBgActive = localStorage.getItem('n_prof_bg_active') === '1';
    if (profBgActive) {
        document.getElementById('profBgToggle').classList.add('active');
        применитьФонПрофиля();
    }

    const bgActive = localStorage.getItem('n_bg_active') === '1';
    const savedValue = localStorage.getItem('n_bg_value');
    const savedImage = await получитьКартинку('n_bg_image');

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
        показатьФон();
    }
}

setTimeout(() => {
    восстановитьСостояние();
}, 1000);

})();
