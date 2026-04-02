const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const ChefProfile = require('../models/ChefProfile');
const { auth } = require('../middleware/auth');

const router = express.Router();
const passwordResetTokens = new Map();

const formatLocation = (location, postalCode) => {
  const baseLocation = (location || '').trim();
  const cleanPostalCode = (postalCode || '').trim().toUpperCase();

  if (!baseLocation && !cleanPostalCode) {
    return null;
  }

  if (!baseLocation) {
    return cleanPostalCode;
  }

  if (!cleanPostalCode) {
    return baseLocation;
  }

  return `${baseLocation}, ${cleanPostalCode}`;
};

// Register
router.post('/register', [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required'),
  body('userType')
    .isIn(['customer', 'chef'])
    .withMessage('Please choose a valid user type (customer or chef)'),
  body('level2CertificationNumber')
    .optional()
    .trim()
    .custom((value, { req }) => {
      if (req.body.userType !== 'chef') {
        return true;
      }

      const normalizedValue = (value || '').toUpperCase();
      if (!/^W[A-Z0-9]{6}$/.test(normalizedValue)) {
        throw new Error('Level 2 certification number must start with W and be exactly 7 characters');
      }

      return true;
    })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const list = errors.array();
      return res.status(400).json({
        error: list[0]?.msg || 'Invalid registration data',
        errors: list
      });
    }

    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      userType,
      location,
      postalCode,
      level2CertificationNumber
    } = req.body;

    const savedLocation = formatLocation(location, postalCode);

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      userType,
      location: savedLocation
    });

    // Create chef profile if user is a chef
    if (userType === 'chef') {
      const cleanCertification = (level2CertificationNumber || '').trim().toUpperCase();
      await ChefProfile.create(userId, {
        certifications: cleanCertification ? `Level 2: ${cleanCertification}` : null
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId, userType },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: userId,
        email,
        firstName,
        lastName,
        userType,
        location: savedLocation,
        profileImage: null,
        coverImage: null
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Forgot password
router.post('/forgot-password', [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const list = errors.array();
      return res.status(400).json({
        error: list[0]?.msg || 'Invalid request',
        errors: list
      });
    }

    const { email } = req.body;
    const user = await User.findByEmail(email);

    // Always return a generic success to avoid account enumeration.
    if (!user) {
      return res.json({
        message: 'If an account exists for this email, a reset link has been generated.'
      });
    }

    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = Date.now() + 15 * 60 * 1000;
    passwordResetTokens.set(token, { userId: user.id, expiresAt });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?resetToken=${token}`;
    console.log(`Password reset token for ${email}: ${token}`);
    console.log(`Password reset URL: ${resetUrl}`);

    return res.json({
      message: 'If an account exists for this email, a reset link has been generated.',
      resetToken: token
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process forgot password request' });
  }
});

// Reset password
router.post('/reset-password', [
  body('token')
    .trim()
    .notEmpty()
    .withMessage('Reset token is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const list = errors.array();
      return res.status(400).json({
        error: list[0]?.msg || 'Invalid request',
        errors: list
      });
    }

    const { token, newPassword } = req.body;
    const tokenRecord = passwordResetTokens.get(token);

    if (!tokenRecord || tokenRecord.expiresAt < Date.now()) {
      passwordResetTokens.delete(token);
      return res.status(400).json({ error: 'Reset token is invalid or expired' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update(tokenRecord.userId, { password: hashedPassword });
    passwordResetTokens.delete(token);

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Login
router.post('/login', [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const list = errors.array();
      return res.status(400).json({
        error: list[0]?.msg || 'Invalid login data',
        errors: list
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, userType: user.user_type },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        userType: user.user_type,
        location: user.location,
        profileImage: user.user_type === 'chef' ? null : user.profile_image,
        coverImage: null
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let profile = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      userType: user.user_type,
      location: user.location,
      profileImage: user.profile_image || null,
      coverImage: null
    };

    // Get chef profile if user is a chef
    if (user.user_type === 'chef') {
      const chefProfile = await ChefProfile.findByUserId(user.id);
      if (chefProfile) {
        profile.chefProfile = chefProfile;
        profile.profileImage = chefProfile.profile_image || profile.profileImage;
        profile.coverImage = chefProfile.cover_image || null;
      }
    }

    res.json(profile);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      location,
      profileImage,
      coverImage,
      bio,
      specialties,
      cuisineTypes,
      experienceYears,
      hourlyRate,
      minSpend,
      certifications,
      isAvailable
    } = req.body;
    const updates = {};

    if (firstName !== undefined) updates.first_name = firstName;
    if (lastName !== undefined) updates.last_name = lastName;
    if (phone !== undefined) updates.phone = phone;
    if (location !== undefined) updates.location = location;

    if (req.user.userType === 'chef') {
      const chefProfileUpdates = {};
      if (profileImage !== undefined) {
        chefProfileUpdates.profileImage = profileImage;
      }
      if (coverImage !== undefined) {
        chefProfileUpdates.coverImage = coverImage;
      }
      if (bio !== undefined) {
        chefProfileUpdates.bio = bio;
      }
      if (specialties !== undefined) {
        chefProfileUpdates.specialties = specialties;
      }
      if (cuisineTypes !== undefined) {
        chefProfileUpdates.cuisineTypes = cuisineTypes;
      }
      if (experienceYears !== undefined) {
        chefProfileUpdates.experienceYears = experienceYears;
      }
      if (hourlyRate !== undefined) {
        chefProfileUpdates.hourlyRate = hourlyRate;
      }
      if (minSpend !== undefined) {
        chefProfileUpdates.minSpend = minSpend;
      }
      if (certifications !== undefined) {
        chefProfileUpdates.certifications = certifications;
      }
      if (isAvailable !== undefined) {
        chefProfileUpdates.isAvailable = isAvailable;
      }
      if (Object.keys(chefProfileUpdates).length > 0) {
        await ChefProfile.update(req.user.id, chefProfileUpdates);
      }
    } else if (profileImage !== undefined) {
      updates.profile_image = profileImage;
    }

    await User.update(req.user.id, updates);
    const refreshedUser = await User.findById(req.user.id);
    const refreshedProfile = {
      id: refreshedUser.id,
      email: refreshedUser.email,
      firstName: refreshedUser.first_name,
      lastName: refreshedUser.last_name,
      phone: refreshedUser.phone,
      userType: refreshedUser.user_type,
      location: refreshedUser.location,
      profileImage: refreshedUser.profile_image || null,
      coverImage: null
    };

    if (refreshedUser.user_type === 'chef') {
      const chefProfile = await ChefProfile.findByUserId(refreshedUser.id);
      if (chefProfile) {
        refreshedProfile.chefProfile = chefProfile;
        refreshedProfile.profileImage = chefProfile.profile_image || refreshedProfile.profileImage;
        refreshedProfile.coverImage = chefProfile.cover_image || null;
      }
    }

    res.json({ message: 'Profile updated successfully', profile: refreshedProfile });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
