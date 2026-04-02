# CooksUp Backend API

Chef booking platform backend with MySQL database.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   - Copy `.env.example` to `.env`
   - Update database credentials and JWT secret

3. **Setup Database**
   ```bash
   npm run db:setup
   ```

4. **Seed Database (Optional)**
   ```bash
   npm run db:seed
   ```

5. **Start Server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/profile` - Get user profile (protected)

### Chefs
- GET `/api/chefs/search` - Search chefs with filters
- GET `/api/chefs/profile/:id` - Get chef profile
- PUT `/api/chefs/profile` - Update chef profile (protected)
- POST `/api/chefs/photo` - Upload chef photo (protected)
- GET `/api/chefs/dashboard/stats` - Get chef dashboard stats (protected)

### Menus
- GET `/api/menus/chef/:chefId` - Get chef's menus
- POST `/api/menus` - Create menu (chef only)
- PUT `/api/menus/:id` - Update menu (chef only)
- DELETE `/api/menus/:id` - Delete menu (chef only)

### Bookings
- POST `/api/bookings` - Create booking (customer only)
- GET `/api/bookings/my-bookings` - Get user's bookings (protected)
- GET `/api/bookings/:id` - Get booking details (protected)
- PUT `/api/bookings/:id/status` - Update booking status (chef only)
- PUT `/api/bookings/:id/cancel` - Cancel booking (protected)

### Reviews
- POST `/api/reviews` - Create review (customer only)
- GET `/api/reviews/chef/:chefId` - Get chef reviews
- GET `/api/reviews/summary/:chefId` - Get rating summary
- GET `/api/reviews/points-history/:chefId` - Get points history

## Database Schema

See `scripts/setupDatabase.js` for complete schema.
