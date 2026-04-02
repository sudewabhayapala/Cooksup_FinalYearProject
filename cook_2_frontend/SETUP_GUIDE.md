# Complete Setup Guide - CooksUp Platform

## Prerequisites

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MySQL** (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/)
- **Git** - [Download](https://git-scm.com/)

---

## Backend Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` with your settings:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=cooksup_db
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_secure_random_string_here_change_in_production
JWT_EXPIRE=7d

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

**Important:** Change `JWT_SECRET` to a strong random string!

### 4. Setup MySQL Database

**Option A: Using MySQL Workbench or Command Line**

1. Open MySQL:
```bash
mysql -u root -p
```

2. Create database:
```sql
CREATE DATABASE cooksup_db;
exit;
```

**Option B: Using the Setup Script**

Just run:
```bash
npm run db:setup
```

This will:
- Create the database
- Create all tables
- Set up indexes and foreign keys

### 5. Seed Sample Data (Optional)
```bash
npm run db:seed
```

This creates demo accounts:
- **Customers:**
  - john.doe@example.com / password123
  - jane.smith@example.com / password123
- **Chefs:**
  - chef.gordon@example.com / password123
  - chef.jamie@example.com / password123
  - chef.maria@example.com / password123

### 6. Start Backend Server
```bash
npm run dev
```

Server will run on: http://localhost:5000

---

## Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd ..
# You should now be in cook_2_frontend directory
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Frontend Development Server
```bash
npm start
```

Frontend will run on: http://localhost:3000

---

## Testing the Application

### 1. Check Backend Health
Open: http://localhost:5000/api/health

Should return: `{"status":"OK","message":"Server is running"}`

### 2. Test API Endpoints

**Register a new user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "userType": "customer",
    "location": "London"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Search Chefs:**
```bash
curl http://localhost:5000/api/chefs/search?location=London
```

### 3. Test Frontend
1. Open http://localhost:3000
2. Click "Register" to create an account
3. Login with your credentials
4. Browse chefs, view profiles
5. Create bookings (if you're a customer)
6. Manage bookings (if you're a chef)

---

## Project Structure

```
cook_2_frontend/
├── backend/
│   ├── config/
│   │   └── database.js          # Database connection
│   ├── middleware/
│   │   ├── auth.js              # Authentication middleware
│   │   ├── errorHandler.js      # Error handling
│   │   └── upload.js            # File upload configuration
│   ├── models/
│   │   ├── User.js              # User model
│   │   ├── ChefProfile.js       # Chef profile model
│   │   ├── Menu.js              # Menu model
│   │   ├── Booking.js           # Booking model
│   │   └── Review.js            # Review model
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── chefs.js             # Chef routes
│   │   ├── menus.js             # Menu routes
│   │   ├── bookings.js          # Booking routes
│   │   ├── reviews.js           # Review routes
│   │   └── upload.js            # File upload routes
│   ├── scripts/
│   │   ├── setupDatabase.js     # Database setup script
│   │   └── seedData.js          # Sample data seeding
│   ├── .env                     # Environment variables
│   ├── .env.example             # Environment template
│   ├── server.js                # Express server
│   ├── package.json             # Dependencies
│   ├── DATABASE.md              # Database documentation
│   └── README.md                # Backend documentation
│
├── src/
│   ├── components/              # React components
│   ├── context/                 # React context
│   ├── pages/                   # Page components
│   ├── services/                # API services
│   └── App.js                   # Main app component
│
└── public/                      # Static files
```

---

## Common Issues & Solutions

### Issue: "Cannot connect to database"
**Solution:** 
- Verify MySQL is running: `mysql --version`
- Check DB credentials in `.env`
- Ensure database exists: `mysql -u root -p -e "SHOW DATABASES;"`

### Issue: "Port 5000 already in use"
**Solution:** 
- Change PORT in `.env` to another port (e.g., 5001)
- Or kill the process: `netstat -ano | findstr :5000` (Windows)

### Issue: "JWT authentication fails"
**Solution:** 
- Check JWT_SECRET is set in `.env`
- Clear browser localStorage
- Re-login to get a new token

### Issue: "CORS errors"
**Solution:** 
- Verify FRONTEND_URL in backend `.env` matches your frontend URL
- Check that cors is properly configured in `server.js`

---

## API Documentation

### Authentication Endpoints

**POST /api/auth/register**
- Register new user
- Body: `{ email, password, firstName, lastName, userType, location }`

**POST /api/auth/login**
- Login user
- Body: `{ email, password }`

**GET /api/auth/profile** (Protected)
- Get user profile
- Headers: `Authorization: Bearer <token>`

### Chef Endpoints

**GET /api/chefs/search**
- Search chefs with filters
- Query params: `location, cuisine, minRating, maxPrice, sortBy`

**GET /api/chefs/profile/:id**
- Get chef profile by ID

**PUT /api/chefs/profile** (Protected, Chef only)
- Update chef profile
- Body: `{ bio, specialties, hourlyRate, cuisineTypes, ... }`

### Booking Endpoints

**POST /api/bookings** (Protected, Customer only)
- Create new booking
- Body: `{ chefId, menuId, eventDate, eventTime, guestCount, ... }`

**GET /api/bookings/my-bookings** (Protected)
- Get user's bookings

**PUT /api/bookings/:id/status** (Protected, Chef only)
- Update booking status
- Body: `{ status }`

### Review Endpoints

**POST /api/reviews** (Protected, Customer only)
- Create review
- Body: `{ bookingId, rating, comment, ... }`

**GET /api/reviews/chef/:chefId**
- Get chef reviews

**GET /api/reviews/summary/:chefId**
- Get rating summary

---

## Database Management

### Backup Database
```bash
mysqldump -u root -p cooksup_db > backup.sql
```

### Restore Database
```bash
mysql -u root -p cooksup_db < backup.sql
```

### Reset Database
```bash
mysql -u root -p -e "DROP DATABASE cooksup_db;"
npm run db:setup
npm run db:seed
```

---

## Production Deployment

### Backend Deployment (Example: Heroku)

1. Create Heroku app:
```bash
heroku create your-app-name
```

2. Add ClearDB MySQL:
```bash
heroku addons:create cleardb:ignite
```

3. Get database URL:
```bash
heroku config | grep CLEARDB_DATABASE_URL
```

4. Set environment variables:
```bash
heroku config:set JWT_SECRET=your_secret
heroku config:set NODE_ENV=production
```

5. Deploy:
```bash
git push heroku main
```

### Frontend Deployment (Example: Vercel)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variable:
- Add `REACT_APP_API_URL` in Vercel dashboard

---

## Support

For issues or questions:
1. Check this guide
2. Review DATABASE.md for schema details
3. Check backend README.md for API docs
4. Review error logs in console

---

## Next Steps

1. **Customize the application:**
   - Update branding and styling
   - Add more features (payment integration, notifications)
   - Enhance search filters

2. **Add payment integration:**
   - Stripe or PayPal for bookings
   - Deposit and full payment flows

3. **Implement real-time features:**
   - Socket.io for live chat
   - Real-time booking updates

4. **Add email notifications:**
   - Nodemailer for booking confirmations
   - Review reminders

5. **Deploy to production:**
   - Set up SSL certificates
   - Configure production database
   - Set up monitoring and logging

Good luck with your chef booking platform! 🚀👨‍🍳
