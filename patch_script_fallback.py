import re

with open('script.js', 'r') as f:
    content = f.read()

fallback_products = """
        // Fallback or empty state
        products = [
            {
                id: 1,
                name: "Tesla Model S Plaid",
                name_ar: "تسلا موديل اس بليد",
                brand_id: 1,
                category: "Sedan",
                category_ar: "سيدان",
                price_egp: 7500000,
                image_url: "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop",
                gallery: [
                    "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=2071&auto=format&fit=crop"
                ],
                description: "The ultimate electric sedan. Unmatched acceleration and range.",
                description_ar: "سيارة السيدان الكهربائية المثالية. تسارع ومدى لا مثيل لهما.",
                details: {
                    mileage: "0 km",
                    transmission: "Automatic",
                    fuel: "Electric",
                    version: "Plaid",
                    upon_request: false
                },
                colors: [
                    { hex: "#ffffff", name: "Pearl White", is_default: true, image_url: "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop" }
                ],
                origin: "Imported",
                is_sold_out: false,
                featured: true,
                order_home: 1,
                order_inventory: 1
            },
            {
                id: 2,
                name: "Porsche Taycan Turbo S",
                name_ar: "بورش تايكان تيربو اس",
                brand_id: 2,
                category: "Sports",
                category_ar: "رياضية",
                price_egp: 12000000,
                image_url: "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?q=80&w=1974&auto=format&fit=crop",
                gallery: [
                    "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?q=80&w=1974&auto=format&fit=crop"
                ],
                description: "Pure Porsche performance, powered by electricity.",
                description_ar: "أداء بورش النقي، يعمل بالكهرباء.",
                details: {
                    mileage: "5,000 km",
                    transmission: "Automatic",
                    fuel: "Electric",
                    version: "Turbo S",
                    upon_request: true
                },
                colors: [
                    { hex: "#c0c0c0", name: "Ice Grey Metallic", is_default: true, image_url: "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?q=80&w=1974&auto=format&fit=crop" }
                ],
                origin: "Imported",
                is_sold_out: false,
                featured: true,
                order_home: 2,
                order_inventory: 2
            },
            {
                id: 3,
                name: "Audi e-tron GT",
                name_ar: "أودي إي-ترون جي تي",
                brand_id: 3,
                category: "Sedan",
                category_ar: "سيدان",
                price_egp: 9000000,
                image_url: "https://images.unsplash.com/photo-1620882813840-7ab17300c144?q=80&w=1974&auto=format&fit=crop",
                gallery: [
                    "https://images.unsplash.com/photo-1620882813840-7ab17300c144?q=80&w=1974&auto=format&fit=crop"
                ],
                description: "Aerodynamic design meets electrifying performance.",
                description_ar: "التصميم الديناميكي الهوائي يلتقي بالأداء المكهرب.",
                details: {
                    mileage: "0 km",
                    transmission: "Automatic",
                    fuel: "Electric",
                    version: "RS",
                    upon_request: false
                },
                colors: [
                    { hex: "#000000", name: "Mythos Black", is_default: true, image_url: "https://images.unsplash.com/photo-1620882813840-7ab17300c144?q=80&w=1974&auto=format&fit=crop" }
                ],
                origin: "Imported",
                is_sold_out: false,
                featured: true,
                order_home: 3,
                order_inventory: 3
            }
        ];
"""

content = re.sub(r'// Fallback or empty state\s*products = \[\];', fallback_products, content)

with open('script.js', 'w') as f:
    f.write(content)
