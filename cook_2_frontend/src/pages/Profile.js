import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toImageUrl } from '../utils/imageUrl';
import './Profile.css';

const API_URL = 'http://localhost:5000/api';

const Profile = () => {
  const { user, getCurrentUser, updateProfile, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    location: ''
  });
  const [chefData, setChefData] = useState({
    bio: '',
    specialties: '',
    cuisineTypes: '',
    experienceYears: '',
    hourlyRate: '',
    minSpend: '',
    certifications: '',
    isAvailable: true
  });
  const [photoPreview, setPhotoPreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCoverFile, setSelectedCoverFile] = useState(null);
  const [photoFocalPoint, setPhotoFocalPoint] = useState({ x: 50, y: 50 });
  const [coverFocalPoint, setCoverFocalPoint] = useState({ x: 50, y: 50 });
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const isChef = (user?.userType || user?.user_type) === 'chef';

  const profileImage = useMemo(() => {
    return user?.profileImage || user?.chefProfile?.profile_image || '';
  }, [user]);

  const coverImage = useMemo(() => {
    return user?.coverImage || user?.chefProfile?.cover_image || '';
  }, [user]);

  useEffect(() => {
    const initProfile = async () => {
      try {
        const profile = await getCurrentUser();
        setFormData({
          firstName: profile?.firstName || '',
          lastName: profile?.lastName || '',
          phone: profile?.phone || '',
          location: profile?.location || ''
        });

        if ((profile?.userType || profile?.user_type) === 'chef') {
          setChefData({
            bio: profile?.chefProfile?.bio || '',
            specialties: profile?.chefProfile?.specialties || '',
            cuisineTypes: profile?.chefProfile?.cuisine_types || '',
            experienceYears: profile?.chefProfile?.experience_years ?? '',
            hourlyRate: profile?.chefProfile?.hourly_rate ?? '',
            minSpend: profile?.chefProfile?.min_spend ?? '',
            certifications: profile?.chefProfile?.certifications || '',
            isAvailable: profile?.chefProfile?.is_available !== false
          });
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load profile');
      }
    };

    initProfile();
  }, [getCurrentUser]);

  useEffect(() => {
    setPhotoPreview(toImageUrl(profileImage));
    setPhotoFocalPoint({ x: 50, y: 50 });
  }, [profileImage]);

  useEffect(() => {
    setCoverPreview(toImageUrl(coverImage));
    setCoverFocalPoint({ x: 50, y: 50 });
  }, [coverImage]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChefInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setChefData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setSuccess('');

    const localPreviewUrl = URL.createObjectURL(file);
    setPhotoPreview(localPreviewUrl);
    setPhotoFocalPoint({ x: 50, y: 50 });
  };

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const getFocalPointFromPointer = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    return {
      x: clamp(x, 0, 100),
      y: clamp(y, 0, 100)
    };
  };

  const updatePhotoFocalFromPointer = (event) => {
    if (!selectedFile) return;
    setPhotoFocalPoint(getFocalPointFromPointer(event));
  };

  const updateCoverFocalFromPointer = (event) => {
    if (!selectedCoverFile) return;
    setCoverFocalPoint(getFocalPointFromPointer(event));
  };

  const createCroppedImageFile = async (file, focalPoint, targetWidth, targetHeight) => {
    if (!file) return null;

    const imageUrl = URL.createObjectURL(file);

    try {
      const image = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = imageUrl;
      });

      const sourceWidth = image.naturalWidth;
      const sourceHeight = image.naturalHeight;
      const targetRatio = targetWidth / targetHeight;
      const sourceRatio = sourceWidth / sourceHeight;

      let cropWidth;
      let cropHeight;

      if (sourceRatio > targetRatio) {
        cropHeight = sourceHeight;
        cropWidth = cropHeight * targetRatio;
      } else {
        cropWidth = sourceWidth;
        cropHeight = cropWidth / targetRatio;
      }

      const focalX = (focalPoint.x / 100) * sourceWidth;
      const focalY = (focalPoint.y / 100) * sourceHeight;
      const sourceX = clamp(focalX - cropWidth / 2, 0, sourceWidth - cropWidth);
      const sourceY = clamp(focalY - cropHeight / 2, 0, sourceHeight - cropHeight);

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const context = canvas.getContext('2d');
      if (!context) return file;

      context.drawImage(
        image,
        sourceX,
        sourceY,
        cropWidth,
        cropHeight,
        0,
        0,
        targetWidth,
        targetHeight
      );

      const mimeType = file.type || 'image/jpeg';
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, mimeType, 0.92);
      });

      if (!blob) return file;

      return new File([blob], file.name, { type: mimeType });
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  };

  const createProfileCroppedFile = async (file, focalPoint) => {
    return createCroppedImageFile(file, focalPoint, 600, 600);
  };

  const createCoverCroppedFile = async (file, focalPoint) => {
    return createCroppedImageFile(file, focalPoint, 1600, 640);
  };

  const handleCoverChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedCoverFile(file);
    setSuccess('');

    const localPreviewUrl = URL.createObjectURL(file);
    setCoverPreview(localPreviewUrl);
    setCoverFocalPoint({ x: 50, y: 50 });
  };

  const uploadImage = async (file, type, fallbackUrl) => {
    if (!file) {
      return fallbackUrl || '';
    }

    const data = new FormData();
    data.append('type', type);
    data.append('image', file);

    const response = await axios.post(`${API_URL}/upload/single`, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data?.url || '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      const processedProfileFile = selectedFile
        ? await createProfileCroppedFile(selectedFile, photoFocalPoint)
        : null;
      const processedCoverFile = selectedCoverFile
        ? await createCoverCroppedFile(selectedCoverFile, coverFocalPoint)
        : null;

      const [photoUrl, coverUrl] = await Promise.all([
        uploadImage(processedProfileFile, 'profile', profileImage),
        isChef ? uploadImage(processedCoverFile, 'cover', coverImage) : Promise.resolve('')
      ]);

      const payload = {
        ...formData,
        profileImage: photoUrl
      };

      if (isChef) {
        payload.coverImage = coverUrl;
        payload.bio = chefData.bio;
        payload.specialties = chefData.specialties;
        payload.cuisineTypes = chefData.cuisineTypes;
        payload.certifications = chefData.certifications;
        payload.isAvailable = chefData.isAvailable;
        payload.experienceYears = chefData.experienceYears === '' ? 0 : Number(chefData.experienceYears);
        payload.hourlyRate = chefData.hourlyRate === '' ? null : Number(chefData.hourlyRate);
        payload.minSpend = chefData.minSpend === '' ? null : Number(chefData.minSpend);
      }

      await updateProfile(payload);

      setSelectedFile(null);
      setSelectedCoverFile(null);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h1>Edit Profile</h1>
        <p className="profile-subtitle">Update your account information and photo</p>

        {error && <div className="profile-alert error">{error}</div>}
        {success && <div className="profile-alert success">{success}</div>}

        <form onSubmit={handleSubmit} className="profile-form">
          {isChef && (
            <div className="cover-section">
              <div
                className={`cover-preview ${selectedCoverFile ? 'adjustable' : ''}`}
                onPointerDown={() => selectedCoverFile && setIsDraggingCover(true)}
                onPointerUp={() => setIsDraggingCover(false)}
                onPointerLeave={() => setIsDraggingCover(false)}
                onPointerMove={(event) => {
                  if (isDraggingCover) {
                    updateCoverFocalFromPointer(event);
                  }
                }}
                onClick={updateCoverFocalFromPointer}
                title={selectedCoverFile ? 'Click or drag to adjust cover framing' : ''}
              >
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Cover"
                    style={{ objectPosition: `${coverFocalPoint.x}% ${coverFocalPoint.y}%` }}
                  />
                ) : (
                  <span>Cover image preview</span>
                )}
              </div>
              <label className="photo-input-label">
                Choose Background Image
                <input type="file" accept="image/*" onChange={handleCoverChange} />
              </label>
              {selectedCoverFile && <small className="photo-help">Drag on the background preview to adjust framing before saving.</small>}
            </div>
          )}

          <div className="photo-section">
            <div
              className={`photo-preview ${selectedFile ? 'adjustable' : ''}`}
              onPointerDown={() => selectedFile && setIsDraggingPhoto(true)}
              onPointerUp={() => setIsDraggingPhoto(false)}
              onPointerLeave={() => setIsDraggingPhoto(false)}
              onPointerMove={(event) => {
                if (isDraggingPhoto) {
                  updatePhotoFocalFromPointer(event);
                }
              }}
              onClick={updatePhotoFocalFromPointer}
              title={selectedFile ? 'Click or drag to adjust photo focus' : ''}
            >
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile"
                  style={{ objectPosition: `${photoFocalPoint.x}% ${photoFocalPoint.y}%` }}
                />
              ) : (
                <span>{(user?.firstName?.[0] || 'U').toUpperCase()}</span>
              )}
            </div>
            <div className="photo-controls">
              <label className="photo-input-label">
                Choose Photo
                <input type="file" accept="image/*" onChange={handlePhotoChange} />
              </label>
              {selectedFile && <small className="photo-help">Drag on the photo preview to adjust framing before saving.</small>}
            </div>
          </div>

          <div className="profile-grid">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input type="email" value={user?.email || ''} disabled />
            </div>

            <div className="form-group">
              <label>Account Type</label>
              <input type="text" value={(user?.userType || '').toUpperCase()} disabled />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Your phone number"
              />
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Your city or area"
              />
            </div>
          </div>

          {isChef && (
            <div className="chef-details-section">
              <h2>About chef</h2>
              <div className="profile-grid">
                <div className="form-group full-width">
                  <label>Bio</label>
                  <textarea
                    name="bio"
                    value={chefData.bio}
                    onChange={handleChefInputChange}
                    rows={5}
                    placeholder="Tell customers about your cooking style and experience"
                  />
                </div>

                <div className="form-group">
                  <label>Specialties</label>
                  <input
                    name="specialties"
                    value={chefData.specialties}
                    onChange={handleChefInputChange}
                    placeholder="Farm-to-table, Fine dining"
                  />
                </div>

                <div className="form-group">
                  <label>Cuisine Types</label>
                  <input
                    name="cuisineTypes"
                    value={chefData.cuisineTypes}
                    onChange={handleChefInputChange}
                    placeholder="American, Italian"
                  />
                </div>

                <div className="form-group">
                  <label>Experience (years)</label>
                  <input
                    name="experienceYears"
                    type="number"
                    min="0"
                    value={chefData.experienceYears}
                    onChange={handleChefInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Hourly rate (USD)</label>
                  <input
                    name="hourlyRate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={chefData.hourlyRate}
                    onChange={handleChefInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Minimum spend (USD)</label>
                  <input
                    name="minSpend"
                    type="number"
                    min="0"
                    step="0.01"
                    value={chefData.minSpend}
                    onChange={handleChefInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Certifications</label>
                  <input
                    name="certifications"
                    value={chefData.certifications}
                    onChange={handleChefInputChange}
                    placeholder="CIA, HACCP"
                  />
                </div>

                <label className="checkbox-row full-width">
                  <input
                    name="isAvailable"
                    type="checkbox"
                    checked={chefData.isAvailable}
                    onChange={handleChefInputChange}
                  />
                  Available for booking
                </label>
              </div>
            </div>
          )}

          <button type="submit" className="save-btn" disabled={isSaving || isLoading}>
            {isSaving || isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
