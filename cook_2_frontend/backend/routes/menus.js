const express = require('express');
const Menu = require('../models/Menu');
const { auth, isChef } = require('../middleware/auth');

const router = express.Router();

// Get chef's menus
router.get('/chef/:chefId', async (req, res) => {
  try {
    const menus = await Menu.findByChefId(req.params.chefId);
    res.json({ menus });
  } catch (error) {
    console.error('Get menus error:', error);
    res.status(500).json({ error: 'Failed to get menus' });
  }
});

// Create menu (chef only)
router.post('/', auth, isChef, async (req, res) => {
  try {
    const {
      title,
      description,
      cuisineType,
      category,
      pricePerPerson,
      minGuests,
      maxGuests,
      courses,
      dietaryOptions,
      imageUrl
    } = req.body;

    if (!title || !pricePerPerson) {
      return res.status(400).json({ error: 'Title and price are required' });
    }

    const menuId = await Menu.create({
      chefId: req.user.id,
      title,
      description,
      cuisineType,
      category,
      pricePerPerson,
      minGuests,
      maxGuests,
      courses,
      dietaryOptions,
      imageUrl
    });

    res.status(201).json({
      message: 'Menu created successfully',
      menuId
    });
  } catch (error) {
    console.error('Create menu error:', error);
    res.status(500).json({ error: 'Failed to create menu' });
  }
});

// Update menu (chef only)
router.put('/:id', auth, isChef, async (req, res) => {
  try {
    const updated = await Menu.update(req.params.id, req.user.id, req.body);
    
    if (!updated) {
      return res.status(404).json({ error: 'Menu not found or no changes made' });
    }

    res.json({ message: 'Menu updated successfully' });
  } catch (error) {
    console.error('Update menu error:', error);
    res.status(500).json({ error: 'Failed to update menu' });
  }
});

// Delete menu (chef only)
router.delete('/:id', auth, isChef, async (req, res) => {
  try {
    await Menu.delete(req.params.id, req.user.id);
    res.json({ message: 'Menu deleted successfully' });
  } catch (error) {
    console.error('Delete menu error:', error);
    res.status(500).json({ error: 'Failed to delete menu' });
  }
});

module.exports = router;
