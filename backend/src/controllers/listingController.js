const { runAsync, getAsync, allAsync } = require('../config/db');

const PRICE_UNITS = ['day', 'week', 'month'];
const AREA_UNITS = ['sq ft', 'sq m', 'm2'];
const TRAFFIC_UNITS = ['day', 'week', 'month'];
const EXPOSURE_UNITS = ['/10', '%'];

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

function normalizeListingInput(body) {
    const {
        title, description, category, size, price_per_day, price_unit,
        area_value, area_unit, location, region, location_url, shop_url, image_url, foot_traffic,
        traffic_unit, exposure_score, exposure_unit, verified
    } = body;

    const parsedPrice = Number(price_per_day);
    const parsedArea = area_value === '' || area_value == null ? null : Number(area_value);
    const parsedTraffic = foot_traffic === '' || foot_traffic == null ? 0 : Number(foot_traffic);
    const parsedExposure = exposure_score === '' || exposure_score == null ? null : Number(exposure_score);
    const safePriceUnit = PRICE_UNITS.includes(price_unit) ? price_unit : 'day';
    const safeAreaUnit = AREA_UNITS.includes(area_unit) ? area_unit : 'sq ft';
    const safeTrafficUnit = TRAFFIC_UNITS.includes(traffic_unit) ? traffic_unit : 'day';
    const safeExposureUnit = EXPOSURE_UNITS.includes(exposure_unit) ? exposure_unit : '/10';

    if (!title || !parsedPrice || parsedPrice <= 0) {
        return { error: 'Title and a positive price_per_day are required' };
    }

    if (parsedArea != null && (Number.isNaN(parsedArea) || parsedArea <= 0)) {
        return { error: 'Surface area must be a positive number' };
    }

    if (Number.isNaN(parsedTraffic) || parsedTraffic < 0) {
        return { error: 'Traffic must be zero or greater' };
    }

    if (parsedExposure != null && (Number.isNaN(parsedExposure) || parsedExposure < 0)) {
        return { error: 'Exposure must be zero or greater' };
    }

    return {
        values: {
            title,
            description,
            category,
            size: parsedArea ? `${parsedArea} ${safeAreaUnit}` : size,
            price_per_day: parsedPrice,
            price_unit: safePriceUnit,
            area_value: parsedArea,
            area_unit: safeAreaUnit,
            location,
            region: region || null,
            location_url,
            shop_url: shop_url || null,
            image_url,
            foot_traffic: parsedTraffic,
            traffic_unit: safeTrafficUnit,
            exposure_score: parsedExposure,
            exposure_unit: safeExposureUnit,
            verified: verified ? 1 : 0,
        },
    };
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
    const normalized = normalizeListingInput(req.body);

    if (normalized.error) {
        return res.status(400).json({ message: normalized.error });
    }

    const listing = normalized.values;

    try {
        const result = await runAsync(
            `INSERT INTO listings (
                host_id, title, description, category, size, price_per_day, price_unit,
                area_value, area_unit, location, region, location_url, shop_url, image_url, foot_traffic, traffic_unit,
                exposure_score, exposure_unit, verified
             )
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                host_id, listing.title, listing.description, listing.category, listing.size,
                listing.price_per_day, listing.price_unit, listing.area_value, listing.area_unit,
                listing.location, listing.region, listing.location_url, listing.shop_url, listing.image_url, listing.foot_traffic, listing.traffic_unit,
                listing.exposure_score, listing.exposure_unit, listing.verified
            ]
        );

        const newListing = await getAsync('SELECT * FROM listings WHERE id = ?', [result.id]);
        res.status(201).json(newListing);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PATCH /api/listings/:id
const updateListing = async (req, res) => {
    const normalized = normalizeListingInput(req.body);

    if (normalized.error) {
        return res.status(400).json({ message: normalized.error });
    }

    try {
        const existingListing = await getAsync('SELECT * FROM listings WHERE id = ?', [req.params.id]);
        if (!existingListing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        if (existingListing.host_id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to edit this listing' });
        }

        const listing = normalized.values;
        await runAsync(
            `UPDATE listings
             SET title = ?, description = ?, category = ?, size = ?, price_per_day = ?,
                 price_unit = ?, area_value = ?, area_unit = ?, location = ?, region = ?, location_url = ?, shop_url = ?, image_url = ?,
                 foot_traffic = ?, traffic_unit = ?, exposure_score = ?, exposure_unit = ?,
                 verified = ?
             WHERE id = ?`,
            [
                listing.title, listing.description, listing.category, listing.size,
                listing.price_per_day, listing.price_unit, listing.area_value, listing.area_unit,
                listing.location, listing.region, listing.location_url, listing.shop_url, listing.image_url, listing.foot_traffic, listing.traffic_unit,
                listing.exposure_score, listing.exposure_unit, listing.verified, req.params.id
            ]
        );

        const updatedListing = await getAsync('SELECT * FROM listings WHERE id = ?', [req.params.id]);
        res.json(updatedListing);
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

module.exports = { getListings, getListingById, createListing, updateListing, getHostListings };
