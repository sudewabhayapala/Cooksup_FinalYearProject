# System Architecture

## Overview
```
┌─────────────────────────────────────────────────────────────────┐
│                         CooksUp Platform                         │
│                     Chef Booking System                          │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Frontend   │ ◄────► │   Backend    │ ◄────► │   Database   │
│   (React)    │  HTTP  │  (Express)   │  MySQL │   (MySQL)    │
└──────────────┘         └──────────────┘         └──────────────┘
```

---

## Frontend Architecture

```
React Application (Port 3000)
│
├── Components
│   └── Header
│       └── Navigation, User Menu
│
├── Pages
│   ├── Home (Landing)
│   ├── Auth (Login/Register)
│   ├── ChefSearch (Browse/Filter)
│   ├── ChefProfile (Details)
│   └── Dashboard (User/Chef Dashboard)
│
├── Context
│   └── AuthContext
│       └── User State, Auth Methods
│
└── Services
    └── API Client (Axios)
        └── HTTP Requests to Backend
```

---

## Backend Architecture

```
Express Server (Port 5000)
│
├── Routes (API Endpoints)
│   ├── /api/auth          → Authentication
│   ├── /api/chefs         → Chef Operations
│   ├── /api/menus         → Menu Management
│   ├── /api/bookings      → Booking Operations
│   ├── /api/reviews       → Review System
│   └── /api/upload        → File Uploads
│
├── Middleware
│   ├── auth               → JWT Verification
│   ├── errorHandler       → Error Management
│   └── upload             → Multer Config
│
├── Models (Database Layer)
│   ├── User
│   ├── ChefProfile
│   ├── Menu
│   ├── Booking
│   └── Review
│
└── Config
    └── database           → MySQL Pool
```

---

## Database Schema

```
┌─────────────────────────────────────────────────────────────┐
│                      Database Tables                         │
└─────────────────────────────────────────────────────────────┘

users ────────┬───── chef_profiles
              │
              ├───── menus ───── menu_items
              │
              ├───── bookings ───── reviews
              │           │
              │           └───── messages
              │
              ├───── chef_photos
              │
              ├───── chef_availability
              │
              └───── favorites


┌─────────────┐
│    users    │  (Base table for all users)
├─────────────┤
│ id          │  PRIMARY KEY
│ email       │  UNIQUE
│ password    │  HASHED
│ user_type   │  'customer' | 'chef'
│ first_name  │
│ last_name   │
│ location    │
└─────────────┘
      ↓ (1:1 for chefs)
┌──────────────────┐
│  chef_profiles   │  (Extended chef info)
├──────────────────┤
│ user_id          │  FOREIGN KEY → users.id
│ bio              │
│ hourly_rate      │
│ cuisine_types    │
│ average_rating   │
│ michelin_stars   │
│ featured         │
└──────────────────┘
      ↓ (1:N)
┌─────────────┐
│    menus    │  (Chef menu offerings)
├─────────────┤
│ chef_id     │  FOREIGN KEY → users.id
│ title       │
│ category    │
│ price       │
│ courses     │
└─────────────┘
      ↓ (1:N)
┌──────────────┐
│  menu_items  │  (Individual dishes)
├──────────────┤
│ menu_id      │  FOREIGN KEY → menus.id
│ course_type  │
│ name         │
│ description  │
└──────────────┘

┌──────────────┐
│   bookings   │  (Customer bookings)
├──────────────┤
│ customer_id  │  FOREIGN KEY → users.id
│ chef_id      │  FOREIGN KEY → users.id
│ menu_id      │  FOREIGN KEY → menus.id
│ event_date   │
│ guest_count  │
│ total_price  │
│ status       │  pending/confirmed/completed
└──────────────┘
      ↓ (1:1)
┌─────────────┐
│   reviews   │  (Customer reviews)
├─────────────┤
│ booking_id  │  FOREIGN KEY → bookings.id
│ chef_id     │  FOREIGN KEY → users.id
│ rating      │  1-5
│ comment     │
│ response    │  (Chef response)
└─────────────┘
```

---

## Request Flow

### Customer Booking Flow
```
1. Customer → Frontend: Browse chefs
   └→ GET /api/chefs/search?location=London

2. Frontend → Backend: Fetch chefs
   └→ MySQL: SELECT chef_profiles JOIN users...

3. Backend → Frontend: Return chef list
   └→ Display: Chef cards with ratings

4. Customer → Frontend: View chef profile
   └→ GET /api/chefs/profile/:id

5. Customer → Frontend: Create booking
   └→ POST /api/bookings
      └→ JWT Auth Middleware
         └→ MySQL: INSERT INTO bookings
            └→ Return: Booking confirmation

6. Chef → Dashboard: View new booking
   └→ GET /api/bookings/my-bookings
      └→ Display: Pending bookings

7. Chef → Confirm booking
   └→ PUT /api/bookings/:id/status
      └→ MySQL: UPDATE bookings SET status='confirmed'

8. Event completes

9. Customer → Leave review
   └→ POST /api/reviews
      └→ MySQL: INSERT INTO reviews
         └→ Trigger: Update chef average_rating
```

### Authentication Flow
```
┌──────────┐                ┌──────────┐                ┌──────────┐
│ Frontend │                │ Backend  │                │ Database │
└────┬─────┘                └────┬─────┘                └────┬─────┘
     │                           │                           │
     │ POST /api/auth/register   │                           │
     │ {email, password, ...}    │                           │
     ├──────────────────────────►│                           │
     │                           │ Hash password (bcrypt)    │
     │                           │                           │
     │                           │ INSERT INTO users         │
     │                           ├──────────────────────────►│
     │                           │                           │
     │                           │◄──────────────────────────┤
     │                           │ User ID                   │
     │                           │                           │
     │                           │ Generate JWT token        │
     │                           │ (userId + userType)       │
     │◄──────────────────────────┤                           │
     │ {token, user}             │                           │
     │                           │                           │
     │ Store token in localStorage                           │
     │                           │                           │
     │ Subsequent requests       │                           │
     │ Authorization: Bearer token│                          │
     ├──────────────────────────►│                           │
     │                           │ Verify JWT                │
     │                           │ Decode userId             │
     │                           │                           │
     │                           │ SELECT * FROM users       │
     │                           ├──────────────────────────►│
     │                           │◄──────────────────────────┤
     │                           │ User data                 │
     │◄──────────────────────────┤                           │
     │ Protected resource        │                           │
     │                           │                           │
```

---

## API Request/Response Examples

### Search Chefs
```
Request:
GET /api/chefs/search?location=London&cuisine=Italian&sortBy=rating

Response:
{
  "chefs": [
    {
      "id": 1,
      "first_name": "Gordon",
      "last_name": "Ramsay",
      "location": "London, UK",
      "cuisine_types": "British, French, Italian",
      "average_rating": 4.9,
      "hourly_rate": 150.00,
      "michelin_stars": 2,
      "total_bookings": 120
    }
  ],
  "total": 1
}
```

### Create Booking
```
Request:
POST /api/bookings
Authorization: Bearer eyJhbGc...
{
  "chefId": 2,
  "menuId": 1,
  "eventDate": "2026-03-15",
  "eventTime": "19:00:00",
  "guestCount": 8,
  "eventLocation": "123 Main St, London",
  "totalPrice": 1200.00
}

Response:
{
  "message": "Booking created successfully",
  "bookingId": 15
}
```

---

## Security Layers

```
┌─────────────────────────────────────────────┐
│         Frontend Security                    │
├─────────────────────────────────────────────┤
│ - Token stored in localStorage               │
│ - Protected routes (React Router)           │
│ - Role-based UI rendering                   │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         Network Security                     │
├─────────────────────────────────────────────┤
│ - HTTPS in production                        │
│ - CORS configuration                         │
│ - Helmet security headers                    │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         Backend Security                     │
├─────────────────────────────────────────────┤
│ - JWT authentication middleware              │
│ - Role-based access control (RBAC)          │
│ - Input validation (express-validator)      │
│ - Password hashing (bcrypt)                 │
│ - SQL injection protection (parameterized)  │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         Database Security                    │
├─────────────────────────────────────────────┤
│ - Foreign key constraints                    │
│ - Data validation at DB level               │
│ - Connection pooling                         │
│ - Encrypted connections (SSL)               │
└─────────────────────────────────────────────┘
```

---

## Deployment Architecture (Production)

```
┌──────────────────────────────────────────────────────────┐
│                         Internet                          │
└────────────────────────┬─────────────────────────────────┘
                         │
                    ┌────▼────┐
                    │   CDN   │  (Static Assets)
                    └────┬────┘
                         │
          ┌──────────────┴──────────────┐
          │                             │
     ┌────▼────┐                  ┌────▼────┐
     │ Vercel  │                  │ Heroku  │
     │ (React) │                  │ (API)   │
     └────┬────┘                  └────┬────┘
          │                             │
          │                        ┌────▼────┐
          │                        │ ClearDB │
          │                        │ (MySQL) │
          │                        └─────────┘
          │
     ┌────▼──────────┐
     │   Cloudinary  │  (Image Storage)
     └───────────────┘
```

---

## File Structure Map

```
Project Root
│
├── Frontend (React SPA)
│   ├── Build → Vercel/Netlify
│   └── Assets → CDN
│
├── Backend (Express API)
│   ├── Deploy → Heroku/Railway
│   └── Uploads → S3/Cloudinary
│
└── Database (MySQL)
    └── Host → ClearDB/PlanetScale
```

---

## Data Flow Example: Creating a Review

```
1. Customer completes booking
   └→ Booking status: 'completed'

2. Customer navigates to review page
   └→ Frontend checks: booking.status === 'completed'

3. Customer submits review
   └→ POST /api/reviews
      {
        bookingId: 15,
        rating: 5,
        comment: "Amazing!"
      }

4. Backend validates
   └→ Check: booking exists
   └→ Check: booking is completed
   └→ Check: user is customer
   └→ Check: review doesn't exist

5. Backend creates review
   └→ INSERT INTO reviews (...)

6. Database trigger fires
   └→ UPDATE chef_profiles
      SET average_rating = (
        SELECT AVG(rating)
        FROM reviews
        WHERE chef_id = X
      )

7. Response to frontend
   └→ { message: "Review created", reviewId: 42 }

8. Frontend updates UI
   └→ Show success message
   └→ Redirect to chef profile
```

---

## Performance Optimizations

### Database
- ✅ Indexed columns (email, user_type, chef_id, etc.)
- ✅ Connection pooling
- ✅ Optimized queries with JOINs
- ✅ Views for complex queries

### Backend
- ✅ Response compression
- ✅ Request logging (Morgan)
- ✅ Error handling
- ✅ Async/await for non-blocking

### Frontend
- ✅ Code splitting
- ✅ Lazy loading
- ✅ Optimized re-renders
- ✅ Cached API responses

---

## Monitoring & Logging

```
Production Stack:

┌─────────────┐
│   Sentry    │  Error Tracking
└─────────────┘

┌─────────────┐
│   LogRocket │  Session Recording
└─────────────┘

┌─────────────┐
│   Morgan    │  Request Logging
└─────────────┘

┌─────────────┐
│   MySQL     │  Query Logs
└─────────────┘
```

---

This architecture provides:
- ✅ Scalability
- ✅ Security
- ✅ Performance
- ✅ Maintainability
- ✅ Extensibility
