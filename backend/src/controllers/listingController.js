const { runAsync, getAsync, allAsync } = require('../config/db');

// score = category_match * 0.6 + location_match * 0.4
// category_match = 1 if match, else 0.5
// location_match = 1 if match, else 0.6
function calculateMatchScore(brand, listing) {
    const category_match = (brand.preferred_category && listing.category &&
        brand.preferred_category.toLowerCase() === listing.category.toLowerCase()) ? 1 : 0.5;

    const location_match = (brand.preferred_location && listing.location &&
        listing.location.toLowerCase().includes(brand.preferred_location.toLowerCase())) ? 1 : 0.6;

    const score = (category_match * 0.6 + location_match * 0.4) * 100;
    return Math.round(score);
}

// GET /api/listings
const getListings = async (req, res) => {
    try {
        let listings = await allAsync('SELECT * FROM listings ORDER BY created_at DESC');

        if (req.user && req.user.role === 'brand') {
            const brand = await getAsync('SELECT * FROM users WHERE id = ?', [req.user.id]);
            if (brand) {
                listings = listings.map(listing => ({
                    ...listing,
                    match_score: calculateMatchScore(brand, listing),
                }));
                // Sort descending by match_score
                listings.sort((a, b) => b.match_score - a.match_score);
            }
        }

        res.json(listings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/listings/:id
const getListingById = async (req, res) => {
    try {
        const listing = await getAsync('SELECT * FROM listings WHERE id = ?', [req.params.id]);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        let result = { ...listing };

        if (req.user && req.user.role === 'brand') {
            const brand = await getAsync('SELECT * FROM users WHERE id = ?', [req.user.id]);
            if (brand) {
                result.match_score = calculateMatchScore(brand, listing);
            }
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/listings
const createListing = async (req, res) => {
    const host_id = req.user.id;
    const {
        title, description, category, size, price_per_day,
        location, image_url, foot_traffic, exposure_score, verified
    } = req.body;

    if (!title || !price_per_day) {
        return res.status(400).json({ message: 'Title and price_per_day are required' });
    }

    try {
        const result = await runAsync(
            `INSERT INTO listings (host_id, title, description, category, size, price_per_day, location, image_url, foot_traffic, exposure_score, verified)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [host_id, title, description, category, size, price_per_day,
                location, image_url, foot_traffic || 0, exposure_score || null, verified ? 1 : 0]
        );

        const newListing = await getAsync('SELECT * FROM listings WHERE id = ?', [result.id]);
        res.status(201).json(newListing);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/listings/host/me
const getHostListings = async (req, res) => {
    try {
        const listings = await allAsync(
            'SELECT * FROM listings WHERE host_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(listings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getListings, getListingById, createListing, getHostListings };
