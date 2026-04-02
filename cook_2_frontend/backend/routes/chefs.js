const express = require('express');
const ChefProfile = require('../models/ChefProfile');
const { auth, isChef } = require('../middleware/auth');

const router = express.Router();

// Search chefs
router.get('/search', async (req, res) => {
  try {
    const filters = {
      location: req.query.location,
      query: req.query.query,
      cuisine: req.query.cuisine,
      minRating: req.query.minRating,
      maxPrice: req.query.maxPrice,
      featured: req.query.featured === 'true',
      sortBy: req.query.sortBy,
      guestCount: req.query.guestCount,
      limit: parseInt(req.query.limit) || 20,
      offset: parseInt(req.query.offset) || 0
    };

    const chefs = await ChefProfile.search(filters);
    res.json({ chefs, total: chefs.length });
  } catch (error) {
    console.error('Search chefs error:', error);
    res.status(500).json({ error: 'Failed to search chefs' });
  }
});

// Get chef profile by ID
router.get('/profile/:id', async (req, res) => {
  try {
    const chef = await ChefProfile.findByUserId(req.params.id);
    if (!chef) {
      return res.status(404).json({ error: 'Chef not found' });
    }
    res.json(chef);
  } catch (error) {
    console.error('Get chef profile error:', error);
    res.status(500).json({ error: 'Failed to get chef profile' });
  }
});

// Update chef profile (protected, chef only)
router.put('/profile', auth, isChef, async (req, res) => {
  try {
    const {
      bio,
      specialties,
      experienceYears,
      hourlyRate,
      minSpend,
      cuisineTypes,
      certifications,
      isAvailable,
      michelinStars,
      celebrityClients
    } = req.body;

    const updates = {};
    if (bio !== undefined) updates.bio = bio;
    if (specialties !== undefined) updates.specialties = specialties;
    if (experienceYears !== undefined) updates.experienceYears = experienceYears;
    if (hourlyRate !== undefined) updates.hourlyRate = hourlyRate;
    if (minSpend !== undefined) updates.minSpend = minSpend;
    if (cuisineTypes !== undefined) updates.cuisineTypes = cuisineTypes;
    if (certifications !== undefined) updates.certifications = certifications;
    if (isAvailable !== undefined) updates.isAvailable = isAvailable;
    if (michelinStars !== undefined) updates.michelinStars = michelinStars;
    if (celebrityClients !== undefined) updates.celebrityClients = celebrityClients;

    await ChefProfile.update(req.user.id, updates);

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update chef profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Upload chef photo (protected, chef only)
router.post('/photo', auth, isChef, async (req, res) => {
  try {
    const { imageUrl, type } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL required' });
    }

    const updates = {};
    if (type === 'profile') {
      updates.profileImage = imageUrl;
    } else if (type === 'cover') {
      updates.coverImage = imageUrl;
    }

    await ChefProfile.update(req.user.id, updates);

    res.json({ message: 'Photo uploaded successfully', imageUrl });
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

// Get chef dashboard stats
router.get('/dashboard/stats', auth, isChef, async (req, res) => {
  try {
    const stats = await ChefProfile.getDashboardStats(req.user.id);
    res.json(stats);
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to get dashboard stats' });
  }
});

module.exports = router;
