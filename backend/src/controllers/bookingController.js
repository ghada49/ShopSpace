const { runAsync, getAsync, allAsync } = require('../config/db');

// POST /api/bookings
const createBooking = async (req, res) => {
    const brand_id = req.user.id;
    const { listing_id, start_date, end_date, total_price } = req.body;

    if (!listing_id || !start_date || !end_date) {
        return res.status(400).json({ message: 'listing_id, start_date, and end_date are required' });
    }

    try {
        const listing = await getAsync('SELECT * FROM listings WHERE id = ?', [listing_id]);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        // Compute total_price if not provided
        const days = Math.max(1, Math.ceil(
            (new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24)
        ));
        const computedTotal = total_price || (listing.price_per_day * days);

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
