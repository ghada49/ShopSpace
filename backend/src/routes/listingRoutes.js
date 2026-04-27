const express = require('express');
const { getListings, getListingById, createListing, updateListing, getHostListings } = require('../controllers/listingController');
const { protect, restrictTo, optionalAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', optionalAuth, getListings);

// /host/me MUST come before /:id to avoid being swallowed by the param route
router.get('/host/me', protect, restrictTo('host'), getHostListings);

router.get('/:id', optionalAuth, getListingById);

router.post('/', protect, restrictTo('host'), createListing);
router.patch('/:id', protect, restrictTo('host'), updateListing);

module.exports = router;
