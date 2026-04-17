/**
 * Legend Automotive - Main Application Logic
 */

// --- Constants & Global Variables ---
let usdToEgpRate = 50.0;
let currentLang = localStorage.getItem('lang') || 'en';
let currentTheme = localStorage.getItem('theme') || 'dark';
let currentCurrency = localStorage.getItem('currency') || 'EGP';
let translations = {};
let products = [];
let brands = [];
let activeBrandFilters = [];
let activeColorFilters = [];
let conditionFilter = 'all';
let priceRange = { min: 0, max: 0, current: 0 };
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

// --- UI Utilities ---
window.showToast = function(message, type = 'success') {
    const existing = document.getElementById('custom-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'custom-toast';
    toast.className = 'fixed bottom-4 right-4 z-[100] px-6 py-3 rounded-lg shadow-xl font-medium text-white transition-all duration-300 transform translate-y-full opacity-0 flex items-center gap-2';

    let icon = 'info';
    if (type === 'success') {
        toast.classList.add('bg-green-600', 'dark:bg-green-700');
        icon = 'check_circle';
    } else if (type === 'error') {
        toast.classList.add('bg-red-600', 'dark:bg-red-700');
        icon = 'error';
    } else {
        toast.classList.add('bg-gray-800', 'dark:bg-gray-700');
    }

    toast.innerHTML = `<span class="material-symbols-outlined">${icon}</span> <span>${escapeHtml(message)}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => { toast.classList.remove('translate-y-full', 'opacity-0'); }, 10);
    setTimeout(() => {
        toast.classList.add('translate-y-full', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

const escapeHtml = (unsafe) => {
    if (unsafe === null || unsafe === undefined) return '';
    if (typeof unsafe !== 'string') unsafe = String(unsafe);
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .catch(err => console.error('Service Worker registration failed:', err));
    }
    init();
});

async function init() {
    // Move language initialization to the very top to prevent flicker/delay
    await setLanguage(currentLang, false);

    updateCurrencyButtonText();
    setupMobileMenu();

    await loadGlobalSettings();
    await fetchExchangeRate();
    await loadBrands();
    await loadProducts();

    const path = window.location.pathname;
    if (path.endsWith("/") || path.endsWith('/')) {
        renderHome();
    } else if (path.endsWith("/inventory")) {
        initInventory();
    } else if (path.endsWith("/details")) {
        renderDetails();
    } else if (path.endsWith("/contact")) {
        initContact();
    } else if (path.endsWith("/favorites")) {
        renderFavorites();
    }
}

// --- Mobile Menu Logic ---
function setupMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('mobile-menu-close');
    const overlay = document.getElementById('mobile-menu-overlay');
    const drawer = document.getElementById('mobile-menu-drawer');

    if (!btn || !overlay || !drawer) return;

    const openMenu = () => {
        overlay.classList.remove('pointer-events-none');
        overlay.classList.add('opacity-100');
        drawer.classList.remove('translate-x-full');
        if (currentLang === 'ar') {
            drawer.classList.remove('-translate-x-full');
            drawer.classList.add('translate-x-0');
        } else {
            drawer.classList.add('translate-x-0');
        }
        document.body.classList.add('mobile-menu-open');
    };

    const closeMenu = () => {
        overlay.classList.add('opacity-0', 'pointer-events-none');
        overlay.classList.remove('opacity-100');
        drawer.classList.add('translate-x-full');
        if (currentLang === 'ar') {
            drawer.classList.add('-translate-x-full');
            drawer.classList.remove('translate-x-0');
        } else {
            drawer.classList.remove('translate-x-0');
        }
        document.body.classList.remove('mobile-menu-open');
    };

    btn.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);

    if (currentLang === 'ar') {
        drawer.classList.remove('right-0');
        drawer.classList.add('left-0', '-translate-x-full');
    }
}

function toggleContactPopup() {
    const popup = document.getElementById('contact-popup');
    if (!popup) return;
    if (popup.classList.contains('hidden')) {
        popup.classList.remove('hidden');
        setTimeout(() => popup.classList.remove('scale-95', 'opacity-0'), 10);
    } else {
        popup.classList.add('scale-95', 'opacity-0');
        setTimeout(() => popup.classList.add('hidden'), 300);
    }
}
window.toggleContactPopup = toggleContactPopup;

// --- State Management ---
async function setLanguage(lang, shouldRender = true) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    if (lang === 'ar') document.body.classList.add('rtl');
    else document.body.classList.remove('rtl');

    if (Object.keys(translations).length === 0) {
        try {
            const response = await fetch('data/translations.json');
            translations = await response.json();
        } catch (error) {
            console.error('Failed to load translations', error);
        }
    }

    updateDOMTranslations();
    updateCurrencyButtonText();

    if (shouldRender) {
        window.location.reload();
    }
}

window.toggleLanguage = function() {
    setLanguage(currentLang === 'en' ? 'ar' : 'en');
}

function updateDOMTranslations() {
    if (!translations[currentLang]) return;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = translations[currentLang][key];
        if (translation) {
            // Preserve icons if they exist
            const icon = el.querySelector('.material-symbols-outlined');
            if (icon) {
                // If there's an icon, we only want to update the text nodes
                Array.from(el.childNodes).forEach(node => {
                    if (node.nodeType === 3 && node.textContent.trim().length > 1) {
                        node.textContent = translation + ' ';
                    }
                });
            } else {
                el.textContent = translation;
            }
        }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[currentLang][key]) el.placeholder = translations[currentLang][key];
    });

    document.querySelectorAll('.lang-toggle').forEach(btn => {
        const span = btn.querySelector('span');
        if (span) span.textContent = currentLang === 'en' ? 'Ar' : 'En';
    });
}

function setCurrency(currency) {
    currentCurrency = currency;
    localStorage.setItem('currency', currency);
    updatePrices();
    updateCurrencyButtonText();
}
window.setCurrency = setCurrency;

window.toggleCurrency = function() {
    setCurrency(currentCurrency === 'USD' ? 'EGP' : 'USD');
}

function updateCurrencyButtonText() {
    const label = currentCurrency === 'USD' ? (translations[currentLang]?.price_usd || 'USD') : (translations[currentLang]?.price_egp || 'L.E');
    document.querySelectorAll('.currency-text').forEach(btn => btn.textContent = label);
}

function updatePrices() {
    document.querySelectorAll('[data-price-egp]').forEach(el => {
        const egp = parseFloat(el.getAttribute('data-price-egp'));
        if (!isNaN(egp) && egp > 0) el.textContent = formatPrice(egp);
        else el.textContent = translations[currentLang]?.upon_request || 'Upon Request';
    });
}

function formatPrice(egp) {
    if (currentCurrency === 'EGP') {
        return `${egp.toLocaleString()} ${translations[currentLang]?.price_egp || 'L.E'}`;
    } else {
        const usd = Math.round(egp / usdToEgpRate);
        if (currentLang === 'en') return `$${usd.toLocaleString()}`;
        return `${usd.toLocaleString()} ${translations[currentLang]?.price_usd || 'USD'}`;
    }
}

async function fetchExchangeRate() {
    try {
        const settings = await window.settingsDb.getAll();
        if (settings.exchange_rate) usdToEgpRate = parseFloat(settings.exchange_rate);
    } catch (e) { console.error(e); }
}

// --- Data Loading ---
async function loadGlobalSettings() {
    try {
        const settings = await window.settingsDb.getAll();

        const applyLink = (id, key, type) => {
            const val = settings[key];
            if (!val) return;
            let links = [];
            try { links = JSON.parse(val); } catch(e) { links = [val]; }
            links = links.filter(l => l && l !== '#');
            if (links.length === 0) return;

            let href = links[0];
            if (type === 'phone') href = `tel:${links[0].replace(/\s+/g, '')}`;
            if (type === 'whatsapp') href = `https://wa.me/${links[0].replace(/\s+/g, '')}`;

            document.querySelectorAll(`[id*="${id}"]`).forEach(el => {
                el.href = href;
                if (id === 'contact-phone' && document.getElementById('contact-phone-display')) {
                    document.getElementById('contact-phone-display').textContent = links[0];
                }
            });
        };

        applyLink('social-instagram', 'instagram_link', 'link');
        applyLink('social-facebook', 'facebook_link', 'link');
        applyLink('social-tiktok', 'tiktok_link', 'link');
        applyLink('social-whatsapp', 'whatsapp_number', 'whatsapp');
        applyLink('social-phone', 'phone_number', 'phone');
        applyLink('social-phone-details', 'phone_number', 'phone');
        applyLink('social-whatsapp-details', 'whatsapp_number', 'whatsapp');
        applyLink('social-instagram-contact', 'instagram_link', 'link');
        applyLink('social-facebook-contact', 'facebook_link', 'link');
        applyLink('social-tiktok-contact', 'tiktok_link', 'link');
        applyLink('social-whatsapp-contact', 'whatsapp_number', 'whatsapp');
        applyLink('social-phone-contact', 'phone_number', 'phone');
        applyLink('drawer-social-instagram', 'instagram_link', 'link');
        applyLink('drawer-social-facebook', 'facebook_link', 'link');
        applyLink('drawer-social-tiktok', 'tiktok_link', 'link');
        applyLink('footer-social-instagram', 'instagram_link', 'link');
        applyLink('footer-social-facebook', 'facebook_link', 'link');
        applyLink('footer-social-tiktok', 'tiktok_link', 'link');
        applyLink('footer-social-whatsapp', 'whatsapp_number', 'whatsapp');
        applyLink('drawer-social-whatsapp', 'whatsapp_number', 'whatsapp');
        applyLink('contact-phone', 'phone_number', 'phone');

        const mapContainer = document.getElementById('map-container');
        if (mapContainer && settings.map_iframe_source) {
            let src = settings.map_iframe_source;
            if (src.startsWith('<iframe')) {
                src = src.replace(/width="[^"]*"/i, 'width="100%"').replace(/height="[^"]*"/i, 'height="100%"');
                mapContainer.innerHTML = src;
            } else {
                mapContainer.innerHTML = `<iframe src="${src}" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy"></iframe>`;
            }
        }

        if (settings.hero_image && document.getElementById('hero-bg-image')) {
            document.getElementById('hero-bg-image').src = settings.hero_image;
            document.getElementById('hero-bg-image').classList.remove('hidden');
        }

        // Live updates
        if (!window.settingsSubscribed) {
            window.settingsSubscribed = true;
            window.supabase.channel('public:settings').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'settings' }, () => {
                loadGlobalSettings();
            }).subscribe();
        }
    } catch (e) { console.error(e); }
}

async function loadBrands() {
    try { brands = await window.brandsDb.getAll(); } catch (e) { console.error(e); }
}

async function loadProducts() {
    try { products = await window.productsDb.getAll(); } catch (e) { console.error(e); }
}

async function loadCategories() {
    try { return await window.categoriesDb.getAll(); } catch (e) { console.error(e); return []; }
}

// --- Rendering ---
function createProductCard(p) {
    const isAr = currentLang === 'ar';
    const name = isAr && p.name_ar ? p.name_ar : p.name;
    const fav = favorites.includes(p.id);

    const formatShortPrice = (val) => {
        if (!val || p.is_upon_request) return translations[currentLang]?.upon_request || 'Upon Request';
        if (currentCurrency === 'EGP') return `${val.toLocaleString()} ${translations[currentLang]?.price_egp || 'L.E'}`;
        const usd = Math.round(val / usdToEgpRate);
        return `${currentLang === 'en' ? '$' : ''}${usd.toLocaleString()}${currentLang === 'ar' ? ' ' + (translations[currentLang]?.price_usd || 'USD') : ''}`;
    };

    return `
    <div class="group relative flex flex-col rounded-xl overflow-hidden bg-surface-container-low transition-all duration-500 hover:-translate-y-2 border border-outline-variant/10">
        <div class="relative aspect-[16/9] w-full overflow-hidden">
            <a href="/details?id=${p.id}">
                <img src="${escapeHtml(p.image_url)}" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${p.is_sold_out ? 'grayscale' : ''}">
                ${p.is_sold_out ? `<div class="sold-out-stamp" data-i18n="sold_out">SOLD OUT</div>` : ''}
            </a>
            <div class="absolute top-4 right-4 z-20">
                <button onclick="toggleFavorite(${p.id}, this)" class="w-10 h-10 rounded-full glass-card flex items-center justify-center ${fav ? 'text-primary' : 'text-white'} transition-colors">
                    <span class="material-symbols-outlined" style="${fav ? "font-variation-settings: 'FILL' 1;" : ""}">favorite</span>
                </button>
            </div>
            <div class="absolute bottom-4 left-4 z-20 flex flex-col gap-2">
                ${p.category ? `<span class="glass-card text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-outline-variant/20">${p.category}</span>` : ''}
                ${p.is_upon_request ? `<span class="bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full" data-i18n="upon_request">Upon Request</span>` : ''}
            </div>
            ${p.version ? `<div class="absolute bottom-4 right-4 z-20 glass-card text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-outline-variant/20">${p.version}</div>` : ''}
        </div>
        <div class="p-6 flex flex-col flex-grow">
            <a href="/details?id=${p.id}" class="text-xl font-bold text-on-surface hover:text-primary transition-colors">${escapeHtml(name)}</a>
            <div class="flex items-center gap-3 text-xs text-on-surface-variant mt-4 font-medium">
                <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">speed</span> ${p.mileage || '-'}</span>
                <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">settings</span> ${p.transmission || '-'}</span>
            </div>
            <div class="mt-auto flex items-center justify-between pt-4 border-t border-outline-variant/15 mt-6">
                <p class="text-2xl font-bold text-primary" data-price-egp="${p.price_egp || 0}">${p.is_upon_request ? (translations[currentLang]?.upon_request || "Upon Request") : formatPrice(p.price_egp || 0)}</p>
                <a href="/details?id=${p.id}" class="text-xs font-bold text-primary flex items-center gap-1 uppercase tracking-widest" data-i18n="view_details">Explore <span class="material-symbols-outlined text-[16px]">arrow_forward</span></a>
            </div>
        </div>
    </div>
    `;
}

function renderHome() {
    const container = document.getElementById('trending-container');
    if (!container) return;
    const spotlight = products.filter(p => p.is_spotlight).sort((a,b) => a.order_spotlight - b.order_spotlight);
    container.innerHTML = spotlight.map(p => createProductCard(p)).join('');
    updatePrices();
    updateDOMTranslations();
}

async function initInventory() {
    const container = document.getElementById('inventory-container');
    if (!container) return;

    // Fill category filter
    const categories = await loadCategories();
    const catSelect = document.getElementById('filter-category');
    if (catSelect) {
        catSelect.innerHTML = `<option value="" data-i18n="filter_category">${translations[currentLang]?.filter_category || 'All Categories'}</option>`;
        categories.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.name;
            opt.textContent = currentLang === 'ar' && c.name_ar ? c.name_ar : c.name;
            catSelect.appendChild(opt);
        });
    }

    renderBrandFilters();
    renderColorFilters();
    initPriceSlider();
    filterInventory();

    document.getElementById('search-input')?.addEventListener('input', filterInventory);
    document.getElementById('filter-category')?.addEventListener('change', filterInventory);
}

function initPriceSlider() {
    const minThumb = document.getElementById('price-min-thumb');
    const maxThumb = document.getElementById('price-max-thumb');
    const fill = document.getElementById('price-slider-fill');
    const minInput = document.getElementById('price-min-slider');
    const maxInput = document.getElementById('price-max-slider');

    if (!minThumb || !maxThumb || !fill) return;

    const prices = products.map(p => p.price_egp).filter(p => p > 0);
    const absMin = prices.length ? Math.min(...prices) : 0;
    const absMax = prices.length ? Math.max(...prices) : 10000000;

    // Sync hidden inputs so filterInventory() can still read them
    [minInput, maxInput].forEach(el => { el.min = absMin; el.max = absMax; });
    minInput.value = absMin;
    maxInput.value = absMax;

    let curMin = absMin;
    let curMax = absMax;

    function updateUI() {
        const range = absMax - absMin || 1;
        const pMin = ((curMin - absMin) / range) * 100;
        const pMax = ((curMax - absMin) / range) * 100;

        fill.style.left  = pMin + '%';
        fill.style.width = (pMax - pMin) + '%';
        minThumb.style.left = pMin + '%';
        maxThumb.style.left = pMax + '%';

        document.getElementById('price-min').textContent = formatPrice(curMin);
        document.getElementById('price-max').textContent = formatPrice(curMax);

        // Keep hidden inputs in sync for filterInventory
        minInput.value = curMin;
        maxInput.value = curMax;
    }

    function getWrapperRect() {
        return document.getElementById('price-slider-wrapper').getBoundingClientRect();
    }

    function startDrag(e, isMin) {
        e.preventDefault();

        function onMove(ev) {
            const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
            const rect = getWrapperRect();
            const range = absMax - absMin || 1;
            let pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
            let val = Math.round(absMin + pct * range);

            if (isMin) {
                curMin = Math.min(val, curMax);
            } else {
                curMax = Math.max(val, curMin);
            }

            updateUI();
            filterInventory();
        }

        function onUp() {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('touchend', onUp);
        }

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onUp);
    }

    minThumb.addEventListener('mousedown',  e => startDrag(e, true));
    maxThumb.addEventListener('mousedown',  e => startDrag(e, false));
    minThumb.addEventListener('touchstart', e => startDrag(e, true),  { passive: false });
    maxThumb.addEventListener('touchstart', e => startDrag(e, false), { passive: false });

    updateUI();
}

function renderBrandFilters() {
    const container = document.getElementById('brand-filters-container');
    if (!container) return;
    container.innerHTML = brands.map(b => `
        <button onclick="toggleBrandFilter(${b.id}, this)" class="w-16 h-16 p-2 rounded-xl border-2 transition-all flex items-center justify-center bg-surface-container-lowest ${activeBrandFilters.includes(b.id) ? 'border-primary' : 'border-outline-variant/20 hover:border-primary'}">
            <img src="${b.logo_url}" alt="${b.name}" class="w-full h-full object-contain pointer-events-none">
        </button>
    `).join('');
}

function renderColorFilters() {
    const container = document.getElementById('color-filters-container');
    if (!container) return;

    // Collect all unique hex colors across all products
    const seen = new Map(); // hex -> name
    products.forEach(p => {
        let variants = p.color_variants || [];
        if (typeof variants === 'string') { try { variants = JSON.parse(variants); } catch(e) { variants = []; } }
        variants.forEach(v => {
            if (v.hex && !seen.has(v.hex)) {
                seen.set(v.hex, currentLang === 'ar' && v.name_ar ? v.name_ar : (v.name || v.hex));
            }
        });
    });

    if (seen.size === 0) {
        container.innerHTML = '<p class="text-xs text-neutral-600">No colors yet</p>';
        return;
    }

    container.innerHTML = Array.from(seen.entries()).map(([hex, name]) => `
        <button
            title="${escapeHtml(name)}"
            onclick="toggleColorFilter('${escapeHtml(hex)}', this)"
            class="color-filter-dot w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${activeColorFilters.includes(hex) ? 'border-primary scale-110 ring-2 ring-primary/40' : 'border-white/20'}"
            style="background:${escapeHtml(hex)}"
            data-hex="${escapeHtml(hex)}"
        ></button>
    `).join('');
}

window.toggleColorFilter = function(hex, btn) {
    const idx = activeColorFilters.indexOf(hex);
    if (idx === -1) activeColorFilters.push(hex);
    else activeColorFilters.splice(idx, 1);
    renderColorFilters();
    filterInventory();
};

window.toggleBrandFilter = function(id, btn) {
    const idx = activeBrandFilters.indexOf(id);
    if (idx === -1) activeBrandFilters.push(id);
    else activeBrandFilters.splice(idx, 1);
    renderBrandFilters();
    filterInventory();
};

function filterInventory() {
    const term = document.getElementById('search-input')?.value.toLowerCase() || '';
    const cat = document.getElementById('filter-category')?.value || '';
    const minPrice = parseInt(document.getElementById('price-min-slider')?.value || 0);
    const maxPrice = parseInt(document.getElementById('price-max-slider')?.value || 999999999);

    const filtered = products.filter(p => {
        const matchesTerm = p.name.toLowerCase().includes(term) || (p.name_ar && p.name_ar.includes(term));
        const matchesCat = !cat || p.category === cat;
        const matchesBrand = activeBrandFilters.length === 0 || activeBrandFilters.includes(p.brand_id);
        const price = p.price_egp || 0;
        const matchesPrice = (price >= minPrice && price <= maxPrice) || (p.is_upon_request);

        let matchesColor = true;
        if (activeColorFilters.length > 0) {
            let variants = p.color_variants || [];
            if (typeof variants === 'string') { try { variants = JSON.parse(variants); } catch(e) { variants = []; } }
            const productHexes = variants.map(v => v.hex).filter(Boolean);
            matchesColor = activeColorFilters.some(h => productHexes.includes(h));
        }

        return matchesTerm && matchesCat && matchesBrand && matchesPrice && matchesColor;
    }).sort((a,b) => a.order_explore - b.order_explore);

    const container = document.getElementById('inventory-container');
    if (container) {
        container.innerHTML = filtered.map(p => createProductCard(p)).join('');
        updatePrices();
        updateDOMTranslations();
    }
}

async function renderDetails() {
    // Inquiry form character counter
    const inqMessageInput = document.getElementById('inq-message');
    const inqCounterDisplay = document.getElementById('inq-message-counter');
    if (inqMessageInput && inqCounterDisplay) {
        inqMessageInput.addEventListener('input', () => {
            const length = inqMessageInput.value.length;
            inqCounterDisplay.textContent = `${length} / 2000`;
        });
    }

    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));

    if (products.length === 0) {
        console.warn('Products list empty, re-fetching...');
        await loadProducts();
    }

    const p = products.find(x => x.id === id);
    if (!p) {
        console.error(`Product ID ${id} not found`);
        const container = document.getElementById('details-container');
        if (container) container.innerHTML = '<div class="text-center py-20 text-2xl font-bold">Vehicle Not Found</div>';
        return;
    }

    document.getElementById('vehicle-title').textContent = currentLang === 'ar' && p.name_ar ? p.name_ar : p.name;
    document.getElementById('vehicle-title-crumb').textContent = document.getElementById('vehicle-title').textContent;
    document.getElementById('vehicle-price').setAttribute('data-price-egp', p.is_upon_request ? 0 : (p.price_egp || 0));
    document.getElementById('vehicle-desc').textContent = currentLang === 'ar' && p.description_ar ? p.description_ar : p.description;

    const favBtn = document.getElementById('btn-favorite-details');
    if (favBtn) {
        const isFav = favorites.includes(p.id);
        const icon = favBtn.querySelector('.material-symbols-outlined');
        if (isFav) {
            icon.style.fontVariationSettings = "'FILL' 1";
            favBtn.classList.add('bg-primary/10');
        } else {
            icon.style.fontVariationSettings = "";
            favBtn.classList.remove('bg-primary/10');
        }
    }

    document.getElementById('spec-mileage').textContent = p.mileage || '-';
    document.getElementById('spec-trans').textContent = p.transmission || '-';
    document.getElementById('spec-fuel').textContent = p.fuel_type || '-';
    document.getElementById('spec-version').textContent = p.version || '-';

    const mainImg = document.getElementById('main-image');
    if (mainImg) mainImg.src = p.image_url;

    // Image Slider Logic
    let currentGalleryIndex = 0;
    let currentGalleryImages = [];
    let galleryInterval = null;

    function startGalleryAutoplay() {
        if (galleryInterval) clearInterval(galleryInterval);
        if (currentGalleryImages.length > 1) {
            galleryInterval = setInterval(() => {
                window.nextImage();
            }, 3000);
        }
    }

    function stopGalleryAutoplay() {
        if (galleryInterval) clearInterval(galleryInterval);
    }
    
    window.nextImage = function() {
        if (currentGalleryImages.length <= 1) return;
        currentGalleryIndex = (currentGalleryIndex + 1) % currentGalleryImages.length;
        updateMainImage();
        startGalleryAutoplay(); // Reset interval
    };
    
    window.prevImage = function() {
        if (currentGalleryImages.length <= 1) return;
        currentGalleryIndex = (currentGalleryIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
        updateMainImage();
        startGalleryAutoplay();
    };

    function updateMainImage() {
        if (!currentGalleryImages[currentGalleryIndex]) return;
        document.getElementById('main-image').src = currentGalleryImages[currentGalleryIndex];
        
        // Update thumbnails
        document.querySelectorAll('#gallery-thumbnails button').forEach((b, idx) => {
            if (idx === currentGalleryIndex) {
                b.classList.add('border-primary');
                b.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            } else {
                b.classList.remove('border-primary');
            }
        });
    }

    window.selectImage = function(idx) {
        currentGalleryIndex = idx;
        updateMainImage();
        startGalleryAutoplay();
    };

    const mediaContainer = document.getElementById('main-media-container');
    if (mediaContainer) {
        mediaContainer.addEventListener('mouseenter', stopGalleryAutoplay);
        mediaContainer.addEventListener('mouseleave', startGalleryAutoplay);
    }

    // Helper: render gallery thumbnails for a given array of image URLs
    function renderGallery(images) {
        const thumbnails = document.getElementById('gallery-thumbnails');
        const prevBtn = document.getElementById('btn-prev-img');
        const nextBtn = document.getElementById('btn-next-img');
        
        if (!thumbnails) return;
        currentGalleryImages = images && images.length ? images : (p.gallery || []);
        currentGalleryIndex = 0;
        
        if (currentGalleryImages.length === 0) { 
            thumbnails.innerHTML = ''; 
            if (prevBtn) prevBtn.classList.add('hidden');
            if (nextBtn) nextBtn.classList.add('hidden');
            stopGalleryAutoplay();
            return; 
        }
        
        if (prevBtn && nextBtn) {
            if (currentGalleryImages.length > 1) {
                prevBtn.classList.remove('hidden');
                nextBtn.classList.remove('hidden');
            } else {
                prevBtn.classList.add('hidden');
                nextBtn.classList.add('hidden');
            }
        }

        thumbnails.innerHTML = currentGalleryImages.map((url, idx) => `
            <button onclick="window.selectImage(${idx})" class="w-24 flex-shrink-0 aspect-video rounded-lg overflow-hidden border border-outline-variant/20 hover:border-primary transition-all">
                <img src="${escapeHtml(url)}" class="w-full h-full object-cover">
            </button>
        `).join('');
        
        updateMainImage();
        startGalleryAutoplay();
    }

    // Render default gallery (product main gallery)
    renderGallery(p.gallery || []);

    // Color variants swatches
    let colorVariants = p.color_variants || [];
    if (typeof colorVariants === 'string') { try { colorVariants = JSON.parse(colorVariants); } catch(e) { colorVariants = []; } }

    const colorContainer = document.getElementById('color-selection-container');
    const colorOptions = document.getElementById('color-options');
    const selectedColorName = document.getElementById('selected-color-name');

    if (colorVariants.length > 0 && colorContainer && colorOptions) {
        colorContainer.classList.remove('hidden');

        colorOptions.innerHTML = colorVariants.map((v, idx) => `
            <button
                onclick="selectColorVariant(${idx})"
                id="color-swatch-${idx}"
                title="${escapeHtml(currentLang === 'ar' && v.name_ar ? v.name_ar : v.name)}"
                class="color-swatch-btn w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${idx === 0 ? 'border-primary scale-110 ring-2 ring-primary/40' : 'border-white/20'}"
                style="background:${escapeHtml(v.hex)}"
            ></button>
        `).join('');

        // Set initial selected name
        if (selectedColorName) {
            const first = colorVariants[0];
            selectedColorName.textContent = currentLang === 'ar' && first.name_ar ? first.name_ar : first.name;
        }

        // Load first variant gallery if it has one
        if (colorVariants[0].gallery && colorVariants[0].gallery.length > 0) {
            mainImg.src = colorVariants[0].gallery[0];
            renderGallery(colorVariants[0].gallery);
        }

        window.selectColorVariant = function(idx) {
            const v = colorVariants[idx];
            if (!v) return;
            // Update swatch selection
            document.querySelectorAll('.color-swatch-btn').forEach((btn, i) => {
                btn.classList.toggle('border-primary', i === idx);
                btn.classList.toggle('scale-110', i === idx);
                btn.classList.toggle('ring-2', i === idx);
                btn.classList.toggle('ring-primary/40', i === idx);
                btn.classList.toggle('border-white/20', i !== idx);
            });
            // Update color name
            if (selectedColorName) {
                selectedColorName.textContent = currentLang === 'ar' && v.name_ar ? v.name_ar : v.name;
            }
            // Switch gallery
            const gallery = v.gallery && v.gallery.length > 0 ? v.gallery : (p.gallery || []);
            if (gallery.length > 0) mainImg.src = gallery[0];
            renderGallery(gallery);
        };
    } else if (colorContainer) {
        colorContainer.classList.add('hidden');
    }


    if (p.diagnostics_url) {
        const btn = document.getElementById('btn-diagnostics');
        if (btn) {
            btn.href = p.diagnostics_url;
            btn.classList.remove('hidden');
        }
    }

    const inqForm = document.getElementById('inquiry-form');
    if (inqForm) {
        inqForm.onsubmit = async (e) => {
            e.preventDefault();
            const btn = inqForm.querySelector('button');
            const originalText = btn.textContent;
            btn.textContent = 'Sending...';
            btn.disabled = true;

            const payload = {
                name: document.getElementById('inq-name').value,
                email: document.getElementById('inq-email').value,
                phone: document.getElementById('inq-phone').value,
                subject: 'Inquiry for ' + p.name,
                message: document.getElementById('inq-message').value
            };

            try {
                await window.messagesDb.create(payload);
                showToast('Thank you! Inquiry sent.');
                inqForm.reset();
                closeInquiryModal();
            } catch (err) {
                showToast('Failed to send inquiry.', 'error');
            } finally {
                btn.textContent = originalText;
                btn.disabled = false;
            }
        };
    }

    updatePrices();
    updateDOMTranslations();
}

// --- Details Page Modals ---
window.openInquiryModal = function() {
    const modal = document.getElementById('inquiry-modal');
    if (modal) modal.classList.remove('hidden');
};

window.closeInquiryModal = function() {
    const modal = document.getElementById('inquiry-modal');
    if (modal) modal.classList.add('hidden');
};

window.toggleDescription = function() {
    const wrapper = document.getElementById('vehicle-desc-wrapper');
    const fade = document.getElementById('vehicle-desc-fade');
    const btnText = document.querySelector('#btn-read-more [data-i18n]');
    const icon = document.querySelector('#btn-read-more .material-symbols-outlined');

    if (wrapper.style.maxHeight === 'none') {
        wrapper.style.maxHeight = '8rem';
        if (fade) fade.classList.remove('hidden');
        if (btnText) btnText.textContent = translations[currentLang]?.read_more || 'Read More';
        if (icon) icon.textContent = 'expand_more';
    } else {
        wrapper.style.maxHeight = 'none';
        if (fade) fade.classList.add('hidden');
        if (btnText) btnText.textContent = translations[currentLang]?.read_less || 'Read Less';
        if (icon) icon.textContent = 'expand_less';
    }
};
window.closeDescriptionModal = () => {};

function initContact() {
    const form = document.getElementById('contact-form');
    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const originalText = btn.textContent;
            btn.textContent = 'Sending...';
            btn.disabled = true;

            const payload = {
                name: document.getElementById('c-name').value,
                email: document.getElementById('c-email').value,
                subject: document.getElementById('c-interest').value,
                message: document.getElementById('c-message').value
            };

            try {
                await window.messagesDb.create(payload);
                showToast('Thank you! Message sent.');
                form.reset();
            } catch (err) {
                showToast('Failed to send message.', 'error');
            } finally {
                btn.textContent = originalText;
                btn.disabled = false;
            }
        };
    }
    updateDOMTranslations();
}

window.toggleFavorite = function(id, btn) {
    const idx = favorites.indexOf(id);
    if (idx === -1) {
        favorites.push(id);
        if (btn) {
            btn.classList.add('text-primary');
            btn.classList.remove('text-white');
            btn.querySelector('span').style.fontVariationSettings = "'FILL' 1";
        }
    } else {
        favorites.splice(idx, 1);
        if (btn) {
            btn.classList.remove('text-primary');
            btn.classList.add('text-white');
            btn.querySelector('span').style.fontVariationSettings = "";
        }
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));

    if (window.location.pathname.endsWith("/favorites")) {
        renderFavorites();
    }
};

window.toggleFavoriteDetails = function() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));
    if (!id) return;

    toggleFavorite(id);
    const favBtn = document.getElementById('btn-favorite-details');
    const isFav = favorites.includes(id);
    const icon = favBtn.querySelector('.material-symbols-outlined');
    if (isFav) {
        icon.style.fontVariationSettings = "'FILL' 1";
        favBtn.classList.add('bg-primary/10');
    } else {
        icon.style.fontVariationSettings = "";
        favBtn.classList.remove('bg-primary/10');
    }
};

function renderFavorites() {
    const container = document.getElementById('favorites-container');
    if (!container) return;

    const favProducts = products.filter(p => favorites.includes(p.id));

    if (favProducts.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-20">
                <span class="material-symbols-outlined text-6xl text-gray-300 mb-4">favorite_border</span>
                <p class="text-xl text-gray-500" data-i18n="no_favorites">You haven't added any favorites yet.</p>
            </div>`;
    } else {
        container.innerHTML = favProducts.map(p => createProductCard(p)).join('');
    }
    updatePrices();
    updateDOMTranslations();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        init,
        setLanguage,
        toggleLanguage: window.toggleLanguage,
        setCurrency,
        toggleCurrency: window.toggleCurrency,
        formatPrice,
        fetchExchangeRate,
        createProductCard,
        renderHome,
        initInventory,
        filterInventory,
        renderDetails,
        loadDetails: renderDetails,
        initContact,
        toggleFavorite: window.toggleFavorite,
        renderFavorites,
        escapeHtml
    };
}
