const express = require('express');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const ChefProfile = require('../models/ChefProfile');
const { auth, isCustomer } = require('../middleware/auth');

const router = express.Router();

// Create review (customer only)
router.post('/', auth, isCustomer, async (req, res) => {
  try {
    const {
      bookingId,
      rating,
      foodQuality,
      professionalism,
      valueForMoney,
      comment,
      images
    } = req.body;

    if (!bookingId || !rating) {
      return res.status(400).json({ error: 'Booking ID and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if booking exists and belongs to customer
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.customer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (booking.status !== 'completed' && booking.status !== 'confirmed') {
      return res.status(400).json({ error: 'Can only review confirmed or completed bookings' });
    }

    // Check if review already exists
    const reviewExists = await Review.checkIfReviewExists(bookingId);
    if (reviewExists) {
      return res.status(400).json({ error: 'Review already exists for this booking' });
    }

    // Create review
    const reviewId = await Review.create({
      bookingId,
      customerId: req.user.id,
      chefId: booking.chef_id,
      rating,
      foodQuality,
      professionalism,
      valueForMoney,
      comment,
      images
    });

    // Update chef's average rating
    await ChefProfile.updateRating(booking.chef_id);

    res.status(201).json({
      message: 'Review created successfully',
      reviewId
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Get chef reviews
router.get('/chef/:chefId', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const reviews = await Review.findByChefId(req.params.chefId, limit, offset);
    res.json({ reviews, total: reviews.length });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Failed to get reviews' });
  }
});

// Get recent reviews (public – used on home page)
router.get('/recent', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 6, 12);
    const reviews = await Review.findRecent(limit);
    res.json({ reviews });
  } catch (error) {
    console.error('Get recent reviews error:', error);
    res.status(500).json({ error: 'Failed to get recent reviews' });
  }
});

// Get review for a specific booking
router.get('/booking/:bookingId', auth, async (req, res) => {
  try {
    const review = await Review.findByBookingId(req.params.bookingId);
    res.json(review || null);
  } catch (error) {
    console.error('Get booking review error:', error);
    res.status(500).json({ error: 'Failed to get review' });
  }
});

// Get rating summary
router.get('/summary/:chefId', async (req, res) => {
  try {
    const summary = await Review.getRatingSummary(req.params.chefId);
    res.json(summary);
  } catch (error) {
    console.error('Get rating summary error:', error);
    res.status(500).json({ error: 'Failed to get rating summary' });
  }
});

// Add response to review (chef only)
router.put('/:id/response', auth, async (req, res) => {
  try {
    const { response } = req.body;

    if (!response) {
      return res.status(400).json({ error: 'Response text is required' });
    }

    await Review.addResponse(req.params.id, req.user.id, response);

    res.json({ message: 'Response added successfully' });
  } catch (error) {
    console.error('Add response error:', error);
    res.status(500).json({ error: 'Failed to add response' });
  }
});

module.exports = router;
