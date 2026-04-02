const express = require('express');
const Booking = require('../models/Booking');
const { auth, isChef, isCustomer } = require('../middleware/auth');

const router = express.Router();

// Create booking (customer only)
router.post('/', auth, isCustomer, async (req, res) => {
  try {
    const {
      chefId,
      menuId,
      eventDate,
      eventTime,
      guestCount,
      numGuests,
      eventType,
      eventLocation,
      specialRequests,
      totalPrice,
      budget
    } = req.body;

    const resolvedGuestCount = guestCount ?? numGuests;
    const resolvedTotalPrice = totalPrice ?? budget;

    if (!chefId || !eventDate || !eventTime || !resolvedGuestCount || !eventLocation || !resolvedTotalPrice) {
      return res.status(400).json({ error: 'Missing required fields: chefId, eventDate, eventTime, guestCount, eventLocation, totalPrice' });
    }

    const bookingId = await Booking.create({
      customerId: req.user.id,
      chefId,
      menuId,
      eventDate,
      eventTime,
      guestCount: Number(resolvedGuestCount),
      eventType,
      eventLocation,
      specialRequests,
      totalPrice: Number(resolvedTotalPrice)
    });

    res.status(201).json({
      message: 'Booking created successfully',
      bookingId
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get user's bookings
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.findByUserId(req.user.id, req.user.userType);
    res.json({ bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to get bookings' });
  }
});

// Get booking details
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if user is involved in this booking
    if (booking.customer_id !== req.user.id && booking.chef_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Failed to get booking' });
  }
});

// Update booking status (chef only)
router.put('/:id/status', auth, isChef, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updated = await Booking.updateStatus(req.params.id, status, req.user.id, 'chef');

    if (!updated) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ message: 'Booking status updated successfully' });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// Pay for booking (customer only, after chef confirms)
router.put('/:id/pay', auth, isCustomer, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.customer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ error: 'Payment is available only after chef confirms the booking' });
    }

    if (booking.payment_status === 'fully_paid') {
      return res.json({ message: 'Booking is already fully paid', paymentStatus: booking.payment_status });
    }

    const paid = await Booking.updatePaymentStatus(req.params.id, req.user.id, 'fully_paid');

    if (!paid) {
      return res.status(400).json({ error: 'Failed to process payment' });
    }

    res.json({ message: 'Payment completed successfully', paymentStatus: 'fully_paid' });
  } catch (error) {
    console.error('Booking payment error:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

// Cancel booking
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const { reason } = req.body;

    const cancelled = await Booking.cancel(req.params.id, req.user.id, reason || 'No reason provided');

    if (!cancelled) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// Get upcoming bookings for chef
router.get('/chef/upcoming', auth, isChef, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const bookings = await Booking.getUpcoming(req.user.id, limit);
    res.json({ bookings });
  } catch (error) {
    console.error('Get upcoming bookings error:', error);
    res.status(500).json({ error: 'Failed to get upcoming bookings' });
  }
});

module.exports = router;
