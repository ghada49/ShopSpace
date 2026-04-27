const { db } = require('../config/db');

const SEED_LISTINGS = [
    // ── Beirut / Hamra ─────────────────────────────────────────────────────────
    {
        title: "Hamra Street Fashion Corner",
        description: "Shelf space inside a busy multi-brand fashion boutique on Hamra's main strip. High student and tourist footfall, ideal for clothing and accessories labels.",
        category: "fashion",
        area_value: 12,
        area_unit: "sq ft",
        price_per_day: 80,
        price_unit: "day",
        region: "Hamra",
        location: "Hamra Street, near AUB gate",
        foot_traffic: 210,
        traffic_unit: "day",
        exposure_score: 8.2,
        exposure_unit: "/10",
        image_url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop",
        verified: 1
    },
    {
        title: "Hamra Wellness Studio Shelf",
        description: "Premium shelf placement inside a popular yoga and wellness studio in Hamra. Great for skincare, wellness, and lifestyle brands.",
        category: "wellness",
        area_value: 8,
        area_unit: "sq ft",
        price_per_day: 65,
        price_unit: "day",
        region: "Hamra",
        location: "Jeanne d'Arc Street, Hamra",
        foot_traffic: 145,
        traffic_unit: "day",
        exposure_score: 7.8,
        exposure_unit: "/10",
        image_url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop",
        verified: 1
    },
    // ── Beirut / Achrafieh ─────────────────────────────────────────────────────
    {
        title: "Rue Gouraud Concept Space",
        description: "Stylish display corner inside a design-forward concept store on Rue Gouraud. Attracts a creative, high-income clientele. Perfect for fashion, art, and home décor.",
        category: "fashion",
        area_value: 20,
        area_unit: "sq ft",
        price_per_day: 130,
        price_unit: "day",
        region: "Achrafieh",
        location: "Rue Gouraud, Achrafieh",
        foot_traffic: 230,
        traffic_unit: "day",
        exposure_score: 8.9,
        exposure_unit: "/10",
        image_url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop",
        verified: 1
    },
    {
        title: "Achrafieh Skincare Boutique Corner",
        description: "In-store shelf inside an upscale beauty boutique in Achrafieh. Strong repeat customer base and high dwell time.",
        category: "skincare",
        area_value: 6,
        area_unit: "sq ft",
        price_per_day: 95,
        price_unit: "day",
        region: "Achrafieh",
        location: "Sassine Square, Achrafieh",
        foot_traffic: 175,
        traffic_unit: "day",
        exposure_score: 8.4,
        exposure_unit: "/10",
        image_url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop",
        verified: 1
    },
    // ── Beirut / Mar Mikhael ───────────────────────────────────────────────────
    {
        title: "Mar Mikhael Gallery Wall",
        description: "Feature wall space inside a trendy art gallery-bar hybrid in Mar Mikhael. Evening crowds, strong social media exposure, perfect for art and lifestyle brands.",
        category: "art",
        area_value: 30,
        area_unit: "sq ft",
        price_per_day: 110,
        price_unit: "day",
        region: "Mar Mikhael",
        location: "Armenia Street, Mar Mikhael",
        foot_traffic: 260,
        traffic_unit: "day",
        exposure_score: 9.0,
        exposure_unit: "/10",
        image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&auto=format&fit=crop",
        verified: 1
    },
    {
        title: "Mar Mikhael Jewelry Pop-Up Table",
        description: "Dedicated pop-up table near the entrance of a popular concept café-boutique. Attracts young professionals and design-conscious shoppers.",
        category: "jewelry",
        area_value: 10,
        area_unit: "sq ft",
        price_per_day: 85,
        price_unit: "day",
        region: "Mar Mikhael",
        location: "Mar Mikhael, near Pépinière",
        foot_traffic: 190,
        traffic_unit: "day",
        exposure_score: 8.3,
        exposure_unit: "/10",
        image_url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&auto=format&fit=crop",
        verified: 0
    },
    // ── Beirut / Gemmayzeh ─────────────────────────────────────────────────────
    {
        title: "Gemmayzeh Stationery & Gifts Shelf",
        description: "Curated shelf space inside a well-known stationery and gift shop in Gemmayzeh. Steady foot traffic from locals and tourists browsing the neighbourhood.",
        category: "stationery",
        area_value: 8,
        area_unit: "sq ft",
        price_per_day: 70,
        price_unit: "day",
        region: "Gemmayzeh",
        location: "Gouraud Street, Gemmayzeh",
        foot_traffic: 155,
        traffic_unit: "day",
        exposure_score: 7.6,
        exposure_unit: "/10",
        image_url: "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=600&auto=format&fit=crop",
        verified: 1
    },
    // ── Beirut / Zaitunay Bay ──────────────────────────────────────────────────
    {
        title: "Zaitunay Bay Marina Kiosk",
        description: "Waterfront kiosk space overlooking the marina. Heavy tourist and weekend traffic. Excellent for lifestyle, accessories, and food brands.",
        category: "lifestyle",
        area_value: 25,
        area_unit: "sq ft",
        price_per_day: 185,
        price_unit: "day",
        region: "Zaitunay Bay",
        location: "Zaitunay Bay Promenade, Beirut",
        foot_traffic: 310,
        traffic_unit: "day",
        exposure_score: 9.4,
        exposure_unit: "/10",
        image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop",
        verified: 1
    },
    // ── Beirut / Verdun ────────────────────────────────────────────────────────
    {
        title: "Verdun Mall Beauty Kiosk",
        description: "Premium in-mall kiosk in the heart of Verdun's shopping district. High weekend traffic and upscale demographic. Ideal for beauty and accessories.",
        category: "beauty",
        area_value: 18,
        area_unit: "sq ft",
        price_per_day: 160,
        price_unit: "day",
        region: "Verdun",
        location: "Verdun Street, near ABC Mall",
        foot_traffic: 325,
        traffic_unit: "day",
        exposure_score: 9.2,
        exposure_unit: "/10",
        image_url: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600&auto=format&fit=crop",
        verified: 1
    },
    // ── Jounieh ────────────────────────────────────────────────────────────────
    {
        title: "Jounieh Marina Fitness Showroom",
        description: "Bright showroom space near Jounieh marina. Booming in summer — attracts active, outdoor-lifestyle customers. Great for fitness and sports brands.",
        category: "fitness",
        area_value: 35,
        area_unit: "sq ft",
        price_per_day: 105,
        price_unit: "day",
        region: "Jounieh",
        location: "Jounieh Marina Waterfront",
        foot_traffic: 200,
        traffic_unit: "day",
        exposure_score: 8.3,
        exposure_unit: "/10",
        image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop",
        verified: 1
    },
    {
        title: "Jounieh Accessories Boutique Shelf",
        description: "Shelf and display space inside a popular accessories boutique in Jounieh. Steady year-round traffic with a summer peak.",
        category: "accessories",
        area_value: 10,
        area_unit: "sq ft",
        price_per_day: 75,
        price_unit: "day",
        region: "Jounieh",
        location: "Rue de Jounieh, Old Town",
        foot_traffic: 165,
        traffic_unit: "day",
        exposure_score: 7.7,
        exposure_unit: "/10",
        image_url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&auto=format&fit=crop",
        verified: 0
    },
    // ── Byblos ─────────────────────────────────────────────────────────────────
    {
        title: "Byblos Souk Handmade Corner",
        description: "Charming display table inside a heritage crafts store in the Byblos souk. Heavy international tourist traffic. Perfect for handmade, artisan, and gifts brands.",
        category: "handmade",
        area_value: 12,
        area_unit: "sq ft",
        price_per_day: 70,
        price_unit: "day",
        region: "Byblos",
        location: "Old Souk, Byblos",
        foot_traffic: 245,
        traffic_unit: "day",
        exposure_score: 8.8,
        exposure_unit: "/10",
        image_url: "https://images.unsplash.com/photo-1520531158340-44015069e78e?w=600&auto=format&fit=crop",
        verified: 1
    },
    {
        title: "Byblos Harbour Café Window",
        description: "Window display space inside a café with full view of the old harbour. Perfect for food, coffee, or artisan product brands targeting tourists.",
        category: "food",
        area_value: 8,
        area_unit: "sq ft",
        price_per_day: 55,
        price_unit: "day",
        region: "Byblos",
        location: "Old Harbour, Byblos",
        foot_traffic: 180,
        traffic_unit: "day",
        exposure_score: 8.0,
        exposure_unit: "/10",
        image_url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop",
        verified: 1
    },
    // ── Tripoli ────────────────────────────────────────────────────────────────
    {
        title: "Tripoli Azmi Street Fashion Rack",
        description: "Rack and shelf space inside a high-traffic clothing store on Tripoli's busiest commercial street. Great entry point into northern Lebanon's market.",
        category: "fashion",
        area_value: 15,
        area_unit: "sq ft",
        price_per_day: 65,
        price_unit: "day",
        region: "Tripoli",
        location: "Azmi Street, Tripoli",
        foot_traffic: 210,
        traffic_unit: "day",
        exposure_score: 8.1,
        exposure_unit: "/10",
        image_url: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&auto=format&fit=crop",
        verified: 1
    },
    {
        title: "Tripoli Old Souk Gifts Stand",
        description: "Stand inside the historic covered souk of Tripoli. Excellent for gifts, handmade, and artisan brands. Authentic setting with loyal local shoppers.",
        category: "gifts",
        area_value: 10,
        area_unit: "sq ft",
        price_per_day: 45,
        price_unit: "day",
        region: "Tripoli",
        location: "Khan El Saboun, Old Souk, Tripoli",
        foot_traffic: 170,
        traffic_unit: "day",
        exposure_score: 7.5,
        exposure_unit: "/10",
        image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop",
        verified: 0
    },
    // ── Saida ──────────────────────────────────────────────────────────────────
    {
        title: "Saida Mall Entrance Kiosk",
        description: "High-visibility kiosk at the main entrance of Saida's busiest mall. Captures all incoming shoppers. Ideal for beauty and accessories launches.",
        category: "beauty",
        area_value: 16,
        area_unit: "sq ft",
        price_per_day: 90,
        price_unit: "day",
        region: "Saida",
        location: "City Mall, Saida",
        foot_traffic: 280,
        traffic_unit: "day",
        exposure_score: 8.6,
        exposure_unit: "/10",
        image_url: "https://images.unsplash.com/photo-1519567770579-c2fc5ff0ed75?w=600&auto=format&fit=crop",
        verified: 1
    },
    // ── Batroun ────────────────────────────────────────────────────────────────
    {
        title: "Batroun Coastal Lifestyle Corner",
        description: "Seasonal pop-up space inside a coastal lifestyle store in Batroun's village centre. Summer peak season with influx of Beirutis and tourists.",
        category: "lifestyle",
        area_value: 14,
        area_unit: "sq ft",
        price_per_day: 60,
        price_unit: "day",
        region: "Batroun",
        location: "Old Village Street, Batroun",
        foot_traffic: 155,
        traffic_unit: "day",
        exposure_score: 7.9,
        exposure_unit: "/10",
        image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop",
        verified: 0
    },
    // ── Broumana ───────────────────────────────────────────────────────────────
    {
        title: "Broumana Home Décor Shelf",
        description: "Shelf space inside a home décor and furniture store in Broumana's main street. Attracts affluent mountain residents and weekend visitors.",
        category: "home decor",
        area_value: 12,
        area_unit: "sq ft",
        price_per_day: 80,
        price_unit: "day",
        region: "Broumana",
        location: "Main Street, Broumana",
        foot_traffic: 130,
        traffic_unit: "day",
        exposure_score: 7.8,
        exposure_unit: "/10",
        image_url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop",
        verified: 1
    },
    // ── Dbayeh ─────────────────────────────────────────────────────────────────
    {
        title: "ABC Dbayeh Kids Zone",
        description: "Dedicated kids product display inside ABC Dbayeh. One of Lebanon's top malls — excellent for children's clothing, toys, and educational brands.",
        category: "kids",
        area_value: 20,
        area_unit: "sq ft",
        price_per_day: 145,
        price_unit: "day",
        region: "Dbayeh",
        location: "ABC Mall, Dbayeh",
        foot_traffic: 340,
        traffic_unit: "day",
        exposure_score: 9.3,
        exposure_unit: "/10",
        image_url: "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=600&auto=format&fit=crop",
        verified: 1
    },
    // ── Downtown Beirut ────────────────────────────────────────────────────────
    {
        title: "Downtown BCD Luxury Window",
        description: "Premium window display in a luxury multi-brand store in Downtown Beirut. Attracts high-net-worth individuals and tourists. Best for premium fashion and jewelry.",
        category: "jewelry",
        area_value: 15,
        area_unit: "sq ft",
        price_per_day: 220,
        price_unit: "day",
        region: "Downtown Beirut",
        location: "Nijmeh Square, Downtown Beirut",
        foot_traffic: 270,
        traffic_unit: "day",
        exposure_score: 9.5,
        exposure_unit: "/10",
        image_url: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&auto=format&fit=crop",
        verified: 1
    },
    // ── Zahle ──────────────────────────────────────────────────────────────────
    {
        title: "Zahle Arak Road Food Stand",
        description: "Food and beverage display stand along the famous Arak Road in Zahle. Excellent for food, coffee, and specialty product brands. Strong local and tourist flow.",
        category: "food",
        area_value: 12,
        area_unit: "sq ft",
        price_per_day: 50,
        price_unit: "day",
        region: "Zahle",
        location: "Arak Road, Zahle",
        foot_traffic: 190,
        traffic_unit: "day",
        exposure_score: 8.0,
        exposure_unit: "/10",
        image_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&auto=format&fit=crop",
        verified: 1
    },
];

const seedListings = () => {
    db.serialize(() => {
        // Wipe ALL listings and re-seed fresh every restart
        db.run('DELETE FROM listings', (err) => {
            if (err) {
                console.error('Error clearing listings:', err.message);
                return;
            }

            console.log('Seeding listings...');

            SEED_LISTINGS.forEach((listing) => {
                db.run(
                    `INSERT INTO listings (
                        title, description, category, area_value, area_unit, size,
                        price_per_day, price_unit, region, location, foot_traffic,
                        traffic_unit, exposure_score, exposure_unit, image_url, verified
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        listing.title,
                        listing.description,
                        listing.category,
                        listing.area_value,
                        listing.area_unit,
                        `${listing.area_value} ${listing.area_unit}`,
                        listing.price_per_day,
                        listing.price_unit,
                        listing.region,
                        listing.location,
                        listing.foot_traffic,
                        listing.traffic_unit,
                        listing.exposure_score,
                        listing.exposure_unit,
                        listing.image_url,
                        listing.verified,
                    ],
                    (err) => { if (err) console.error('Seed insert error:', err.message); }
                );
            });

            console.log('Seed completed');
        });
    });
};

module.exports = seedListings;
