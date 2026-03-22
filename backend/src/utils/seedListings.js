const { db } = require('../config/db');

const SEED_LISTINGS = [
    {
        title: "Hamra Boutique Corner",
        description: "Prime retail space inside a busy fashion boutique near AUB. Perfect for student-facing brands.",
        category: "fashion",
        size: "2m x 2m",
        price_per_day: 80,
        location: "Hamra, Beirut",
        image_url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop",
        foot_traffic: 185,
        exposure_score: 8.2,
        verified: 1
    },
    {
        title: "ABC Verdun Pop-Up",
        description: "Premium mall space with strong weekend traffic and high-end clientele.",
        category: "beauty",
        size: "3m kiosk",
        price_per_day: 150,
        location: "Verdun, Beirut",
        image_url: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600&auto=format&fit=crop",
        foot_traffic: 310,
        exposure_score: 9.1,
        verified: 1
    },
    {
        title: "Achrafieh Concept Store",
        description: "Trendy placement inside a design-focused store on Rue Gouraud.",
        category: "fashion",
        size: "2.5m space",
        price_per_day: 120,
        location: "Achrafieh, Beirut",
        image_url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop",
        foot_traffic: 215,
        exposure_score: 8.5,
        verified: 1
    },
    {
        title: "Zaitunay Bay Kiosk",
        description: "Waterfront premium retail space with heavy tourist exposure overlooking the marina.",
        category: "lifestyle",
        size: "3m kiosk",
        price_per_day: 180,
        location: "Zaitunay Bay, Beirut",
        image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop",
        foot_traffic: 290,
        exposure_score: 9.3,
        verified: 1
    },
    {
        title: "Saida Old Souk Store",
        description: "Authentic shop inside the historic souk of Saida. Great for handmade and artisan brands.",
        category: "handmade",
        size: "2m shelf",
        price_per_day: 50,
        location: "Old Souk, Saida",
        image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop",
        foot_traffic: 160,
        exposure_score: 7.8,
        verified: 0
    },
    {
        title: "Saida Mall Entrance Stand",
        description: "High visibility retail stand near the main entrance of Saida Mall.",
        category: "beauty",
        size: "stand",
        price_per_day: 90,
        location: "Saida",
        image_url: "https://images.unsplash.com/photo-1519567770579-c2fc5ff0ed75?w=600&auto=format&fit=crop",
        foot_traffic: 230,
        exposure_score: 8.4,
        verified: 1
    },
    {
        title: "Tripoli Mina Café Corner",
        description: "Lifestyle display inside a popular seaside café in Tripoli's Mina district.",
        category: "lifestyle",
        size: "table display",
        price_per_day: 60,
        location: "Mina, Tripoli",
        image_url: "https://images.unsplash.com/photo-1525193612562-0ec53b0e5d7c?w=600&auto=format&fit=crop",
        foot_traffic: 170,
        exposure_score: 7.9,
        verified: 1
    },
    {
        title: "Tripoli Azmi Street Shop",
        description: "Retail space inside a busy clothing store on Tripoli's main commercial street.",
        category: "fashion",
        size: "rack + shelf",
        price_per_day: 70,
        location: "Azmi Street, Tripoli",
        image_url: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&auto=format&fit=crop",
        foot_traffic: 195,
        exposure_score: 8.0,
        verified: 0
    },
    {
        title: "Jounieh Marina Showroom",
        description: "High-visibility showroom near Jounieh marina. Booming in summer season.",
        category: "fitness",
        size: "display zone",
        price_per_day: 100,
        location: "Jounieh",
        image_url: "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=600&auto=format&fit=crop",
        foot_traffic: 175,
        exposure_score: 8.1,
        verified: 1
    },
    {
        title: "Byblos Souk Artisan Corner",
        description: "Charming artisan shop in Byblos heritage area. Heavy with international tourists.",
        category: "handmade",
        size: "display table",
        price_per_day: 65,
        location: "Byblos",
        image_url: "https://images.unsplash.com/photo-1520531158340-44015069e78e?w=600&auto=format&fit=crop",
        foot_traffic: 220,
        exposure_score: 8.6,
        verified: 1
    }
];

const seedListings = () => {
    db.get('SELECT COUNT(*) as count FROM listings', (err, row) => {
        if (err) {
            console.error('Error checking listings:', err.message);
            return;
        }

        if (row && row.count > 0) {
            console.log('Listings already seeded');
            return;
        }

        console.log('Seeding listings...');

        db.serialize(() => {
            SEED_LISTINGS.forEach((listing) => {
                db.run(
                    `INSERT INTO listings (title, description, category, size, price_per_day, location, image_url, foot_traffic, exposure_score, verified)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        listing.title, listing.description, listing.category, listing.size,
                        listing.price_per_day, listing.location, listing.image_url,
                        listing.foot_traffic, listing.exposure_score, listing.verified
                    ],
                    (err) => { if (err) console.error('Seed insert error:', err.message); }
                );
            });
        });

        console.log('Seed completed');
    });
};

module.exports = seedListings;
