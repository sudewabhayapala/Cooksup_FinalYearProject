# API Quick Reference

Base URL: `http://localhost:5000/api`

## Authentication

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+44 7700 900000",
  "userType": "customer",  // or "chef"
  "location": "London, UK"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "userType": "customer",
    "location": "London, UK"
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Get Profile (Protected)
```http
GET /auth/profile
Authorization: Bearer <token>
```

### Update Profile (Protected)
```http
PUT /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+44 7700 900000",
  "location": "London, UK",
  "profileImage": "/uploads/profile/image-12345.jpg"
}
```

---

## Chefs

### Search Chefs
```http
GET /chefs/search?location=London&cuisine=Italian&minRating=4&sortBy=rating
```

**Query Parameters:**
- `location` - Filter by location
- `cuisine` - Filter by cuisine type
- `minRating` - Minimum rating (1-5)
- `maxPrice` - Maximum hourly rate
- `featured` - Show only featured chefs (true/false)
- `sortBy` - Sort by: rating, price_low, price_high
- `limit` - Results per page (default: 20)
- `offset` - Pagination offset

**Response:**
```json
{
  "chefs": [
    {
      "id": 1,
      "user_id": 2,
      "first_name": "Gordon",
      "last_name": "Ramsay",
      "bio": "Award-winning chef...",
      "average_rating": 4.9,
      "hourly_rate": 150.00,
      "min_spend": 500.00,
      "cuisine_types": "British, French, Mediterranean",
      "location": "London, UK",
      "michelin_stars": 2,
      "total_bookings": 120
    }
  ],
  "total": 1
}
```

### Get Chef Profile
```http
GET /chefs/profile/:id
```

### Update Chef Profile (Protected - Chef only)
```http
PUT /chefs/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "bio": "Experienced chef with...",
  "specialties": "Fine Dining, French Cuisine",
  "experienceYears": 15,
  "hourlyRate": 120.00,
  "minSpend": 400.00,
  "cuisineTypes": "French, Italian, Mediterranean",
  "isAvailable": true
}
```

### Get Dashboard Stats (Protected - Chef only)
```http
GET /chefs/dashboard/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "total_bookings": 50,
  "pending_bookings": 3,
  "completed_bookings": 45,
  "avg_rating": 4.8,
  "total_reviews": 42,
  "total_earnings": 15000.00
}
```

---

## Menus

### Get Chef's Menus
```http
GET /menus/chef/:chefId
```

**Response:**
```json
{
  "menus": [
    {
      "id": 1,
      "chef_id": 2,
      "title": "Premium Fine Dining Experience",
      "description": "7-course tasting menu...",
      "cuisine_type": "Fine Dining",
      "category": "Fine Dining",
      "price_per_person": 150.00,
      "min_guests": 2,
      "max_guests": 12,
      "courses": 7,
      "dietary_options": "Vegetarian available",
      "is_active": true
    }
  ]
}
```

### Create Menu (Protected - Chef only)
```http
POST /menus
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Italian Family Feast",
  "description": "Authentic Italian family dining",
  "cuisineType": "Italian",
  "category": "Casual",
  "pricePerPerson": 80.00,
  "minGuests": 6,
  "maxGuests": 30,
  "courses": 4,
  "dietaryOptions": "Vegetarian, Vegan options"
}
```

### Update Menu (Protected - Chef only)
```http
PUT /menus/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Menu Title",
  "pricePerPerson": 85.00
}
```

### Delete Menu (Protected - Chef only)
```http
DELETE /menus/:id
Authorization: Bearer <token>
```

---

## Bookings

### Create Booking (Protected - Customer only)
```http
POST /bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "chefId": 2,
  "menuId": 1,
  "eventDate": "2026-03-15",
  "eventTime": "19:00:00",
  "guestCount": 8,
  "eventType": "Birthday",
  "eventLocation": "123 Main St, London",
  "specialRequests": "Champagne on arrival",
  "totalPrice": 1200.00
}
```

### Get My Bookings (Protected)
```http
GET /bookings/my-bookings
Authorization: Bearer <token>
```

### Get Booking Details (Protected)
```http
GET /bookings/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "customer_id": 1,
  "chef_id": 2,
  "menu_id": 1,
  "event_date": "2026-03-15",
  "event_time": "19:00:00",
  "guest_count": 8,
  "event_type": "Birthday",
  "event_location": "123 Main St, London",
  "special_requests": "Champagne on arrival",
  "total_price": 1200.00,
  "status": "confirmed",
  "payment_status": "pending",
  "customer_first_name": "John",
  "customer_last_name": "Doe",
  "chef_first_name": "Gordon",
  "chef_last_name": "Ramsay",
  "menu_title": "Premium Fine Dining Experience"
}
```

### Update Booking Status (Protected - Chef only)
```http
PUT /bookings/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "confirmed"  // pending, confirmed, in_progress, completed, cancelled
}
```

### Cancel Booking (Protected)
```http
PUT /bookings/:id/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Customer request"
}
```

### Get Upcoming Bookings (Protected - Chef only)
```http
GET /bookings/chef/upcoming?limit=5
Authorization: Bearer <token>
```

---

## Reviews

### Create Review (Protected - Customer only)
```http
POST /reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookingId": 1,
  "rating": 5,
  "foodQuality": 5,
  "professionalism": 5,
  "valueForMoney": 4,
  "comment": "Absolutely amazing experience!",
  "images": ["url1", "url2"]
}
```

### Get Chef Reviews
```http
GET /reviews/chef/:chefId?limit=20&offset=0
```

**Response:**
```json
{
  "reviews": [
    {
      "id": 1,
      "rating": 5,
      "food_quality": 5,
      "professionalism": 5,
      "value_for_money": 4,
      "comment": "Absolutely amazing!",
      "customer_first_name": "John",
      "customer_last_name": "Doe",
      "event_date": "2026-01-15",
      "event_type": "Anniversary",
      "created_at": "2026-01-16T10:30:00.000Z"
    }
  ],
  "total": 1
}
```

### Get Rating Summary
```http
GET /reviews/summary/:chefId
```

**Response:**
```json
{
  "total_reviews": 42,
  "average_rating": 4.8,
  "avg_food_quality": 4.9,
  "avg_professionalism": 4.8,
  "avg_value_for_money": 4.7,
  "five_star": 30,
  "four_star": 10,
  "three_star": 2,
  "two_star": 0,
  "one_star": 0
}
```

### Add Response to Review (Protected - Chef only)
```http
PUT /reviews/:id/response
Authorization: Bearer <token>
Content-Type: application/json

{
  "response": "Thank you for the wonderful review!"
}
```

---

## File Upload

### Upload Single Image (Protected)
```http
POST /upload/single
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "image": <file>,
  "type": "profile"  // or "cover", "menu", "portfolio"
}
```

**Response:**
```json
{
  "message": "File uploaded successfully",
  "url": "/uploads/profile/image-1234567890.jpg",
  "filename": "image-1234567890.jpg"
}
```

### Upload Multiple Images (Protected)
```http
POST /upload/multiple
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "images": [<file1>, <file2>, ...],
  "type": "portfolio"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation Error",
  "details": "Email is required"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied. Chef account required"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Status Codes

- **200** - Success
- **201** - Created
- **400** - Bad Request
- **401** - Unauthorized
- **403** - Forbidden
- **404** - Not Found
- **500** - Internal Server Error

---

## Testing with curl

### Register and Login Flow
```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123","firstName":"Test","lastName":"User","userType":"customer"}'

# 2. Login (save the token)
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123"}' \
  | jq -r '.token')

# 3. Get Profile
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"

# 4. Search Chefs
curl http://localhost:5000/api/chefs/search?location=London

# 5. Create Booking
curl -X POST http://localhost:5000/api/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"chefId":2,"eventDate":"2026-03-15","eventTime":"19:00","guestCount":8,"eventLocation":"London","totalPrice":800}'
```

---

## Rate Limiting

Currently no rate limiting is implemented. For production, consider adding:
- express-rate-limit for API throttling
- Redis for distributed rate limiting

---

## Pagination

For endpoints that return lists:
- Use `limit` and `offset` query parameters
- Default limit is usually 20
- Example: `/api/chefs/search?limit=10&offset=20`
