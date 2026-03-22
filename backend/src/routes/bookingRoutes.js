const express = require('express');
const {
    createBooking,
    getBrandBookings,
    getHostBookings,
    updateBookingStatus
} = require('../controllers/bookingController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', protect, restrictTo('brand'), createBooking);
router.get('/brand/me', protect, restrictTo('brand'), getBrandBookings);
router.get('/host/me', protect, restrictTo('host'), getHostBookings);
router.patch('/:id/status', protect, restrictTo('host'), updateBookingStatus);

module.exports = router;
