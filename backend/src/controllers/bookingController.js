const { runAsync, getAsync, allAsync } = require('../config/db');

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function parseDateOnly(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
}

function getBillingUnits(days, priceUnit) {
    if (priceUnit === 'week') return Math.ceil(days / 7);
    if (priceUnit === 'month') return Math.ceil(days / 30);
    return days;
}

// POST /api/bookings
const createBooking = async (req, res) => {
    const brand_id = req.user.id;
    const { listing_id, start_date, end_date } = req.body;

    if (!listing_id || !start_date || !end_date) {
        return res.status(400).json({ message: 'listing_id, start_date, and end_date are required' });
    }

    const startDate = parseDateOnly(start_date);
    const endDate = parseDateOnly(end_date);

    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Dates must use YYYY-MM-DD format' });
    }

    if (endDate <= startDate) {
        return res.status(400).json({ message: 'End date must be after start date' });
    }

    try {
        const listing = await getAsync('SELECT * FROM listings WHERE id = ?', [listing_id]);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        const overlap = await getAsync(
            `SELECT id FROM bookings
             WHERE listing_id = ?
               AND status IN ('pending', 'approved')
               AND start_date < ?
               AND end_date > ?
             LIMIT 1`,
            [listing_id, end_date, start_date]
        );

        if (overlap) {
            return res.status(409).json({ message: 'This space already has a request for those dates' });
        }

        const days = Math.max(1, Math.ceil((endDate - startDate) / MS_PER_DAY));
        const billingUnits = getBillingUnits(days, listing.price_unit);
        const subtotal = listing.price_per_day * billingUnits;
        const computedTotal = subtotal + Math.round(subtotal * 0.10);

        const result = await runAsync(
            'INSERT INTO bookings (listing_id, brand_id, start_date, end_date, total_price) VALUES (?, ?, ?, ?, ?)',
            [listing_id, brand_id, start_date, end_date, computedTotal]
        );

        const newBooking = await getAsync('SELECT * FROM bookings WHERE id = ?', [result.id]);
        res.status(201).json(newBooking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/bookings/brand/me
const getBrandBookings = async (req, res) => {
    try {
        const bookings = await allAsync(
            `SELECT b.id, b.listing_id, b.brand_id, b.start_date, b.end_date,
                    b.status, b.total_price, b.created_at,
                    l.title AS listing_title, l.location AS listing_location,
                    l.image_url AS listing_image, l.price_per_day
             FROM bookings b
             JOIN listings l ON b.listing_id = l.id
             WHERE b.brand_id = ?
             ORDER BY b.created_at DESC`,
            [req.user.id]
        );
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/bookings/host/me
const getHostBookings = async (req, res) => {
    try {
        const bookings = await allAsync(
            `SELECT b.id, b.listing_id, b.brand_id, b.start_date, b.end_date,
                    b.status, b.total_price, b.created_at,
                    l.title AS listing_title, l.location AS listing_location,
                    u.name AS brand_name, u.email AS brand_email
             FROM bookings b
             JOIN listings l ON b.listing_id = l.id
             JOIN users u ON b.brand_id = u.id
             WHERE l.host_id = ?
             ORDER BY b.created_at DESC`,
            [req.user.id]
        );
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PATCH /api/bookings/:id/status
const updateBookingStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (status !== 'approved' && status !== 'rejected') {
        return res.status(400).json({ message: 'Status must be approved or rejected' });
    }

    try {
        const booking = await getAsync(
            `SELECT b.*, l.host_id
             FROM bookings b
             JOIN listings l ON b.listing_id = l.id
             WHERE b.id = ?`,
            [id]
        );

        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.host_id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this booking' });
        }

        await runAsync('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
        res.json({ id: parseInt(id), status, message: `Booking ${status}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createBooking, getBrandBookings, getHostBookings, updateBookingStatus };
