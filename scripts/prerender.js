const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');
const fs = require('fs');
const path = require('path');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
  realtime: { transport: ws }
});

async function prerender() {
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, name_ar, description, description_ar, price_egp, discount_price, is_upon_request, fuel_type, transmission, mileage, version, image_url, category, brand_id');

  if (error) { console.error(error); process.exit(1); }

  const { data: brands } = await supabase.from('brands').select('id, name');
  const brandMap = {};
  brands.forEach(b => brandMap[b.id] = b.name);

  if (!fs.existsSync('cars')) fs.mkdirSync('cars');

  for (const p of products) {
    const brandName = brandMap[p.brand_id] || 'Legend Automotive';
    const price = p.is_upon_request ? 'Upon Request' : (p.discount_price || p.price_egp || 0).toLocaleString() + ' L.E';
    const condition = (!p.mileage || parseInt(p.mileage) === 0) ? 'NewCondition' : 'UsedCondition';
    const image = p.image_url || 'https://www.legendautomotiveeg.com/assets/images/logo.jpg';
    const title = `${p.name} ${p.version || ''} - ${brandName} | Legend Automotive`;
    const desc = p.description || `Buy ${p.name} in Cairo, Egypt at Legend Automotive. ${brandName} dealer in Nasr City.`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${desc.substring(0, 160)}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://www.legendautomotiveeg.com/details?id=${p.id}">
<meta property="og:type" content="product">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc.substring(0, 160)}">
<meta property="og:image" content="${image}">
<meta property="og:url" content="https://www.legendautomotiveeg.com/details?id=${p.id}">
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:title" content="${title}">
<meta property="twitter:description" content="${desc.substring(0, 160)}">
<meta property="twitter:image" content="${image}">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Vehicle",
  "name": "${p.name}",
  "description": "${desc.replace(/"/g, '\\"').substring(0, 300)}",
  "brand": { "@type": "Brand", "name": "${brandName}" },
  "image": "${image}",
  "fuelType": "${p.fuel_type || ''}",
  "vehicleTransmission": "${p.transmission || ''}",
  "mileageFromOdometer": "${p.mileage || '0'}",
  "itemCondition": "https://schema.org/${condition}",
  "offers": {
    "@type": "Offer",
    "price": "${p.is_upon_request ? '0' : (p.discount_price || p.price_egp || 0)}",
    "priceCurrency": "EGP",
    "availability": "${p.is_upon_request ? 'https://schema.org/PreOrder' : 'https://schema.org/InStock'}",
    "seller": { "@type": "AutoDealer", "name": "Legend Automotive", "url": "https://www.legendautomotiveeg.com" }
  }
}
</script>
<script>window.location.replace('https://www.legendautomotiveeg.com/details?id=${p.id}');</script>
</head>
<body>
<h1>${p.name} ${p.version || ''}</h1>
<p>Brand: ${brandName}</p>
<p>Price: ${price}</p>
<p>Fuel: ${p.fuel_type || ''}</p>
<p>Transmission: ${p.transmission || ''}</p>
<p>Category: ${p.category || ''}</p>
<p>${desc}</p>
<a href="https://www.legendautomotiveeg.com/details?id=${p.id}">View full details at Legend Automotive</a>
</body>
</html>`;

    fs.writeFileSync(path.join('cars', `${p.id}.html`), html);
    console.log(`Pre-rendered: cars/${p.id}.html — ${p.name}`);
  }

  console.log(`Done. ${products.length} pages pre-rendered.`);
}

prerender();
