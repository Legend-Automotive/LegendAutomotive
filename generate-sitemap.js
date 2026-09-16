/**
 * generate-sitemap.js
 *
 * Fetches all products from Supabase and regenerates sitemap.xml with:
 *  - the existing static pages
 *  - a /details?id=X entry for every product row
 *
 * Usage: node generate-sitemap.js
 *
 * Credentials are read from supabase-config.js (browser-style file, so we
 * extract the SUPABASE_URL / SUPABASE_ANON_KEY constants instead of
 * require()-ing it directly, since that file references `window`).
 */

const fs = require('fs');
const path = require('path');

const SITE_ORIGIN = 'https://www.legendautomotiveeg.com';
const CONFIG_PATH = path.join(__dirname, 'supabase-config.js');
const OUTPUT_PATH = path.join(__dirname, 'sitemap.xml');

const STATIC_PAGES = [
    { loc: '/', changefreq: 'daily', priority: '1.0' },
    { loc: '/inventory', changefreq: 'daily', priority: '0.9' },
    { loc: '/about', changefreq: 'monthly', priority: '0.7' },
    { loc: '/contact', changefreq: 'monthly', priority: '0.7' },
    { loc: '/favorites', changefreq: 'monthly', priority: '0.4' },
];

function readSupabaseCredentials() {
    const src = fs.readFileSync(CONFIG_PATH, 'utf8');

    const urlMatch = src.match(/SUPABASE_URL\s*=\s*["']([^"']+)["']/);
    const keyMatch = src.match(/SUPABASE_ANON_KEY\s*=\s*["']([^"']+)["']/);

    if (!urlMatch || !keyMatch) {
        throw new Error(`Could not find SUPABASE_URL / SUPABASE_ANON_KEY in ${CONFIG_PATH}`);
    }

    return { url: urlMatch[1], key: keyMatch[1] };
}

const FUEL_TYPE_PAGES = [
    { loc: '/inventory?fuel=electric', changefreq: 'weekly', priority: '0.7' },
    { loc: '/inventory?fuel=petrol', changefreq: 'weekly', priority: '0.7' },
];

const COLOR_PAGES = [
    { loc: '/inventory?color=White', changefreq: 'weekly', priority: '0.6' },
    { loc: '/inventory?color=Black', changefreq: 'weekly', priority: '0.6' },
    { loc: '/inventory?color=Silver', changefreq: 'weekly', priority: '0.6' },
    { loc: '/inventory?color=Grey', changefreq: 'weekly', priority: '0.6' },
    { loc: '/inventory?color=Blue', changefreq: 'weekly', priority: '0.6' },
];

const COMBINED_FILTER_PAGES = [
    { loc: '/inventory?brand=BYD&fuel=electric', changefreq: 'weekly', priority: '0.7' },
    { loc: '/inventory?brand=Deepal&fuel=electric', changefreq: 'weekly', priority: '0.7' },
    { loc: '/inventory?brand=AVATR&fuel=electric', changefreq: 'weekly', priority: '0.7' },
    { loc: '/inventory?brand=Zeekr&fuel=electric', changefreq: 'weekly', priority: '0.7' },
    { loc: '/inventory?brand=Xiaomi+Auto&fuel=electric', changefreq: 'weekly', priority: '0.7' },
    { loc: '/inventory?brand=Dongfeng&fuel=electric', changefreq: 'weekly', priority: '0.7' },
    { loc: '/inventory?brand=Mercedes-Benz&fuel=petrol', changefreq: 'weekly', priority: '0.7' },
    { loc: '/inventory?brand=Kia&fuel=petrol', changefreq: 'weekly', priority: '0.7' },
    { loc: '/inventory?brand=Nissan&fuel=petrol', changefreq: 'weekly', priority: '0.7' },
    { loc: '/inventory?brand=Volkswagen&fuel=petrol', changefreq: 'weekly', priority: '0.7' },
];

async function supabaseGet({ url, key }, table, select) {
    const endpoint = `${url}/rest/v1/${table}?select=${select}`;

    const res = await fetch(endpoint, {
        headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
        },
    });

    if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`Supabase request failed (${table}): ${res.status} ${res.statusText} ${body}`);
    }

    return res.json();
}

async function fetchProducts(creds) {
    // NOTE: products.sql defines the column as brand_id (FK to brands), not
    // "brand" — selecting brand_id here instead of a nonexistent "brand" column.
    return supabaseGet(creds, 'products', 'id,name,brand_id,category');
}

async function fetchBrands(creds) {
    return supabaseGet(creds, 'brands', 'id,name');
}

function uniqueCategories(products) {
    const seen = new Set();
    const result = [];
    for (const p of products) {
        const cat = p.category;
        if (!cat || seen.has(cat)) continue;
        seen.add(cat);
        result.push(cat);
    }
    return result;
}

function xmlEscape(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function buildUrlEntry(loc, lastmod, changefreq, priority) {
    return [
        '  <url>',
        `    <loc>${xmlEscape(loc)}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <changefreq>${changefreq}</changefreq>`,
        `    <priority>${priority}</priority>`,
        '  </url>',
    ].join('\n');
}

function buildSitemap({ products, brands, categories }, lastmod) {
    const records = [];

    for (const page of STATIC_PAGES) {
        records.push({ loc: `${SITE_ORIGIN}${page.loc}`, changefreq: page.changefreq, priority: page.priority });
    }

    for (const p of products) {
        if (p.id === undefined || p.id === null) continue;
        const loc = `${SITE_ORIGIN}/details?id=${encodeURIComponent(p.id)}`;
        records.push({ loc, changefreq: 'weekly', priority: '0.8' });

        const carLoc = `${SITE_ORIGIN}/cars/${encodeURIComponent(p.id)}.html`;
        records.push({ loc: carLoc, changefreq: 'daily', priority: '0.9' });
    }

    for (const b of brands) {
        if (!b.name) continue;
        const loc = `${SITE_ORIGIN}/inventory?brand=${encodeURIComponent(b.name)}`;
        records.push({ loc, changefreq: 'weekly', priority: '0.7' });
    }

    for (const page of FUEL_TYPE_PAGES) {
        records.push({ loc: `${SITE_ORIGIN}${page.loc}`, changefreq: page.changefreq, priority: page.priority });
    }

    for (const cat of categories) {
        const loc = `${SITE_ORIGIN}/inventory?category=${encodeURIComponent(cat)}`;
        records.push({ loc, changefreq: 'weekly', priority: '0.7' });
    }

    for (const page of COLOR_PAGES) {
        records.push({ loc: `${SITE_ORIGIN}${page.loc}`, changefreq: page.changefreq, priority: page.priority });
    }

    for (const page of COMBINED_FILTER_PAGES) {
        records.push({ loc: `${SITE_ORIGIN}${page.loc}`, changefreq: page.changefreq, priority: page.priority });
    }

    const entries = records.map(r => buildUrlEntry(r.loc, lastmod, r.changefreq, r.priority));

    return {
        xml: [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
            entries.join('\n'),
            '</urlset>',
            '',
        ].join('\n'),
        counts: {
            base: records.length,
            total: records.length,
            colorPages: COLOR_PAGES.length,
            combinedFilterPages: COMBINED_FILTER_PAGES.length,
        },
    };
}

async function main() {
    const creds = readSupabaseCredentials();
    const [products, brands] = await Promise.all([
        fetchProducts(creds),
        fetchBrands(creds),
    ]);
    const categories = uniqueCategories(products);

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const { xml, counts } = buildSitemap({ products, brands, categories }, today);

    fs.writeFileSync(OUTPUT_PATH, xml, 'utf8');

    console.log(`Product URLs added: ${products.length}`);
    console.log(`Brand filter URLs added: ${brands.length}`);
    console.log(`Fuel type URLs added: ${FUEL_TYPE_PAGES.length}`);
    console.log(`Category URLs added: ${categories.length}`);
    console.log(`Color filter URLs added: ${counts.colorPages}`);
    console.log(`Combined filter URLs added: ${counts.combinedFilterPages}`);
    console.log(`Total URLs in sitemap: ${counts.total}`);
    console.log(`Sitemap written to: ${OUTPUT_PATH}`);
}

main().catch(err => {
    console.error('Failed to generate sitemap:', err.message);
    process.exitCode = 1;
});
