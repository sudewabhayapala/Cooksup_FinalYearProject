# 🚀 CooksUp - Chef Booking Platform

## Complete Project Overview

A full-stack chef booking platform similar to yhangry.com, built with React, Node.js, Express, and MySQL.

---

## 📁 Project Structure

```
cook_2_frontend/
│
├── 📋 SETUP_GUIDE.md           # Complete setup instructions
├── 🔧 setup.ps1                # Windows automated setup script
│
├── backend/                    # Backend API Server
│   ├── config/
│   │   └── database.js         # MySQL connection pool
│   │
│   ├── middleware/
│   │   ├── auth.js             # JWT authentication
│   │   ├── errorHandler.js     # Global error handler
│   │   └── upload.js           # File upload (Multer)
│   │
│   ├── models/
│   │   ├── User.js             # User model
│   │   ├── ChefProfile.js      # Chef profile model
│   │   ├── Menu.js             # Menu model
│   │   ├── Booking.js          # Booking model
│   │   └── Review.js           # Review model
│   │
│   ├── routes/
│   │   ├── auth.js             # Auth endpoints (register, login)
│   │   ├── chefs.js            # Chef endpoints (search, profile)
│   │   ├── menus.js            # Menu CRUD
│   │   ├── bookings.js         # Booking management
│   │   ├── reviews.js          # Review system
│   │   └── upload.js           # File upload endpoint
│   │
│   ├── scripts/
│   │   ├── setupDatabase.js    # Database initialization
│   │   └── seedData.js         # Sample data seeding
│   │
│   ├── 📖 API_REFERENCE.md     # Complete API documentation
│   ├── 📖 DATABASE.md          # Database schema docs
│   ├── 📖 README.md            # Backend README
│   ├── 📄 schema.sql           # SQL schema file
│   ├── 🔧 server.js            # Express server
│   ├── 📦 package.json         # Backend dependencies
│   ├── .env.example            # Environment template
│   └── .gitignore
│
├── src/                        # Frontend React App
│   ├── components/
│   │   ├── Header.js
│   │   └── Header.css
│   │
│   ├── context/
│   │   └── AuthContext.js      # Authentication context
│   │
│   ├── pages/
│   │   ├── Home.js             # Landing page
│   │   ├── Login.js            # Login page
│   │   ├── Register.js         # Registration page
│   │   ├── ChefSearch.js       # Chef search/browse
│   │   ├── ChefProfile.js      # Individual chef profile
│   │   └── Dashboard.js        # User dashboard
│   │
│   ├── services/
│   │   └── api.js              # API client (Axios)
│   │
│   ├── App.js                  # Main app component
│   ├── App.css
│   ├── index.js
│   └── index.css
│
├── public/
│   └── index.html
│
└── 📦 package.json             # Frontend dependencies
```

---

## 🗄️ Database Schema

### Tables (10 total)

1. **users** - All user accounts (customers & chefs)
2. **chef_profiles** - Extended chef information
3. **menus** - Chef menu offerings
4. **menu_items** - Individual menu items
5. **bookings** - Customer bookings
6. **reviews** - Customer reviews
7. **chef_photos** - Portfolio images
8. **chef_availability** - Availability calendar
9. **messages** - Booking messages
10. **favorites** - Customer favorites

### Key Features
- ✅ Role-based access (Customer/Chef)
- ✅ Multi-criteria reviews
- ✅ Search & filtering
- ✅ Booking workflow
- ✅ Menu management
- ✅ File uploads
- ✅ Rating system

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get profile (protected)

### Chefs
- `GET /api/chefs/search` - Search chefs
- `GET /api/chefs/profile/:id` - Get chef profile
- `PUT /api/chefs/profile` - Update profile (chef only)
- `GET /api/chefs/dashboard/stats` - Dashboard stats (chef only)

### Menus
- `GET /api/menus/chef/:chefId` - Get chef menus
- `POST /api/menus` - Create menu (chef only)
- `PUT /api/menus/:id` - Update menu (chef only)
- `DELETE /api/menus/:id` - Delete menu (chef only)

### Bookings
- `POST /api/bookings` - Create booking (customer only)
- `GET /api/bookings/my-bookings` - Get user bookings
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id/status` - Update status (chef only)
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Reviews
- `POST /api/reviews` - Create review (customer only)
- `GET /api/reviews/chef/:chefId` - Get chef reviews
- `GET /api/reviews/summary/:chefId` - Get rating summary

### Upload
- `POST /api/upload/single` - Upload single image
- `POST /api/upload/multiple` - Upload multiple images

---

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- MySQL v8.0+
- Git

### Option 1: Automated Setup (Windows)
```powershell
.\setup.ps1
```

### Option 2: Manual Setup

**1. Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MySQL credentials
npm run db:setup
npm run db:seed
npm run dev
```

**2. Frontend Setup** (new terminal)
```bash
npm install
npm start
```

**3. Access**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- API Health: http://localhost:5000/api/health

---

## 👥 Demo Accounts

After running `npm run db:seed`:

**Customers:**
- john.doe@example.com / password123
- jane.smith@example.com / password123

**Chefs:**
- chef.gordon@example.com / password123
- chef.jamie@example.com / password123
- chef.maria@example.com / password123

---

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MySQL2** - Database driver
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **Helmet** - Security headers
- **CORS** - Cross-origin support
- **Morgan** - Request logging

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Context API** - State management

### Database
- **MySQL** - Relational database

---

## 📚 Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Complete setup instructions
- **[backend/API_REFERENCE.md](backend/API_REFERENCE.md)** - API documentation
- **[backend/DATABASE.md](backend/DATABASE.md)** - Database schema docs
- **[backend/README.md](backend/README.md)** - Backend overview

---

## 🔑 Key Features

### For Customers
- ✅ Browse and search chefs
- ✅ Filter by location, cuisine, rating, price
- ✅ View chef profiles and menus
- ✅ Create bookings
- ✅ Leave reviews
- ✅ Manage bookings
- ✅ Save favorite chefs

### For Chefs
- ✅ Create and manage profile
- ✅ Add multiple menus
- ✅ Manage bookings
- ✅ View dashboard statistics
- ✅ Upload portfolio images
- ✅ Set availability
- ✅ Respond to reviews

### Admin Features (Future)
- User management
- Featured chef selection
- Content moderation
- Analytics dashboard

---

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control
- ✅ Input validation
- ✅ SQL injection protection
- ✅ XSS protection headers
- ✅ CORS configuration
- ✅ Secure file upload

---

## 📊 Database Highlights

**10 tables** with:
- Foreign key constraints
- Indexes for performance
- Triggers for auto-updates
- Views for common queries
- Transaction support

**Key Relationships:**
- Users → Chef Profiles (1:1)
- Chefs → Menus (1:N)
- Chefs → Bookings (1:N)
- Bookings → Reviews (1:1)
- Menus → Menu Items (1:N)

---

## 🎯 Use Cases

### Customer Journey
1. Register/Login
2. Search for chefs by location/cuisine
3. View chef profiles and menus
4. Create booking
5. Receive confirmation
6. Event happens
7. Leave review

### Chef Journey
1. Register as chef
2. Complete profile
3. Add menus
4. Receive booking requests
5. Confirm bookings
6. Complete events
7. Receive reviews

---

## 🚧 Future Enhancements

- [ ] Payment integration (Stripe)
- [ ] Real-time chat (Socket.io)
- [ ] Email notifications
- [ ] SMS reminders
- [ ] Advanced search filters
- [ ] Chef analytics dashboard
- [ ] Mobile app
- [ ] Admin panel
- [ ] Multi-language support
- [ ] Rating badges/achievements

---

## 📝 Scripts

### Backend Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server
npm run db:setup   # Initialize database
npm run db:seed    # Add sample data
```

### Frontend Scripts
```bash
npm start          # Start development server
npm build          # Create production build
npm test           # Run tests
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is open source and available under the MIT License.

---

## 💬 Support

For questions or issues:
1. Check documentation files
2. Review API_REFERENCE.md
3. Check DATABASE.md for schema
4. Review SETUP_GUIDE.md for setup issues

---

## 🙏 Acknowledgments

- Inspired by [yhangry.com](https://yhangry.com)
- Built with modern web technologies
- Designed for scalability and performance

---

**Built with ❤️ for connecting chefs and food lovers**

🚀 Happy Coding! 👨‍🍳
