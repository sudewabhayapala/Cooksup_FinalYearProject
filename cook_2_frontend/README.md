# 🍳 CooksUp - Chef Booking Platform

A complete full-stack chef booking platform inspired by yhangry.com, connecting customers with professional chefs for private dining experiences.

## 🌟 Features

### For Customers
- 🔍 Search and filter chefs by location, cuisine, and rating
- 👨‍🍳 View detailed chef profiles with portfolios and reviews
- 📅 Book chefs for events with custom menus
- ⭐ Leave reviews and ratings
- 💬 Message chefs through the platform
- ❤️ Save favorite chefs

### For Chefs
- 📝 Create comprehensive profiles
- 🍽️ Add multiple menu offerings
- 📊 Dashboard with statistics and analytics
- 📆 Manage bookings and availability
- 🖼️ Upload portfolio images
- 💰 Track earnings and bookings

## 🚀 Quick Start

### Prerequisites
- **Node.js** v16+ ([Download](https://nodejs.org/))
- **MySQL** v8.0+ ([Download](https://dev.mysql.com/downloads/))

### Automated Setup (Windows)
```powershell
.\setup.ps1
```

### Manual Setup

**1. Clone/Download the project**

**2. Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MySQL credentials
npm run db:setup
npm run db:seed
npm run dev
```

**3. Setup Frontend** (new terminal)
```bash
npm install
npm start
```

**4. Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/api/health

## 📚 Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Complete installation & configuration
- **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** - Project structure & features
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture & data flow
- **[backend/API_REFERENCE.md](backend/API_REFERENCE.md)** - API endpoints
- **[backend/DATABASE.md](backend/DATABASE.md)** - Database schema

## 👥 Demo Accounts

After seeding the database (`npm run db:seed`):

**Customers:**
- john.doe@example.com / password123
- jane.smith@example.com / password123

**Chefs:**
- chef.gordon@example.com / password123
- chef.jamie@example.com / password123
- chef.maria@example.com / password123

## 🛠️ Technology Stack

**Frontend:**
- React 18
- React Router v6
- Axios
- Context API

**Backend:**
- Node.js & Express
- MySQL2
- JWT Authentication
- Bcrypt
- Multer (file uploads)

**Database:**
- MySQL 8.0
- 10 tables with relationships
- Indexes & triggers

## 📁 Project Structure

React-based user interface for CooksUp chef booking platform.

## Quick Start

### Prerequisites
- Node.js v14+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm start
```

Frontend runs on `http://localhost:3000`

## Project Structure

```
src/
├── components/
│   ├── Header.js         # Navigation header
│   └── Header.css
├── context/
│   └── AuthContext.js    # Authentication context
├── pages/
│   ├── Home.js           # Landing page
│   ├── Login.js          # Login page
│   ├── Register.js       # Registration page
│   ├── ChefSearch.js     # Chef search and filter
│   ├── ChefProfile.js    # Chef detailed profile
│   └── Dashboard.js      # User dashboard
├── services/
│   └── api.js            # API service layer
├── App.js                # Main app component
└── index.js              # Entry point
```

## Pages

### Home (`/`)
- Landing page with hero section
- Features overview
- Call-to-action buttons
- Testimonials

### Register (`/register`)
- User registration form
- User type selection (Chef/Client)
- Personal information input
- Password setup

### Login (`/login`)
- Email/password authentication
- Remember me option
- Forgot password link

### Chef Search (`/chefs`)
- Browse all chefs
- Filter by:
  - Location
  - Specialty
  - Minimum rating
- Sort options
- View basic chef info

### Chef Profile (`/chef/:chefId`)
- Detailed chef information
- Portfolio/photos gallery
- Reviews and ratings
- Booking form
- Statistics

### Dashboard (`/dashboard`)
**For Chefs:**
- Stats overview (rating, points, bookings)
- Pending bookings
- Recent completions
- Manage bookings

**For Clients:**
- My bookings
- Booking history
- Booking status

## Components

### Header
Navigation bar with:
- Logo
- Navigation links
- Authentication links
- User menu (when logged in)
- Responsive mobile menu

## State Management

### AuthContext
Manages:
- User authentication state
- Login/logout
- User data
- JWT tokens
- API authorization

## Services

### API Service (`services/api.js`)
Provides:
- Chef search and profile APIs
- Booking management APIs
- Review and rating APIs
- Authentication APIs

## Styling

- CSS3 with custom properties
- Responsive design
- Mobile-first approach
- Consistent color scheme
  - Primary: #667eea
  - Error: #e74c3c
  - Dark: #2c3e50
  - Light: #ecf0f1

## Key Features

### Chef Search
```javascript
<ChefSearch />
```
- Real-time filtering
- Sort by rating or points
- Display chef cards with stats

### Chef Profiles
- Portfolio gallery
- Review section
- Quick booking button

### Booking Form
- Modal-based form
- Event details input
- Menu requirements
- Special requests

### Dashboard
- Different views for chef/client
- Stats and metrics
- Booking management

## Authentication Flow

1. User registers or logs in
2. JWT token stored in localStorage
3. Token added to all API requests
4. Protected routes redirect to login if no token
5. Logout clears token and user data

## API Integration

All API calls use axios with:
```javascript
const response = await api.get('/endpoint');
const response = await api.post('/endpoint', data);
```

Base URL: `http://localhost:5000/api`

## Environment Configuration

API base URL configured in `services/api.js`:
```javascript
const API_URL = 'http://localhost:5000/api';
```

## Available Scripts

```bash
npm start      # Start dev server
npm build      # Production build
npm test       # Run tests
npm eject      # Eject from create-react-app
```

## Build for Production

```bash
npm run build
```

Creates optimized production build in `build/` directory.

## Performance Optimizations

- Code splitting
- Lazy loading
- Component memoization
- Efficient re-renders

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.14.0",
  "axios": "^1.4.0",
  "date-fns": "^2.30.0"
}
```

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## Support

For issues, open a ticket in the main repository.
