# Flight Experience Booking System

A modern, full-featured booking system for flight experiences built with HTML, CSS, JavaScript, and Supabase.

## Features

### Public Features
- Browse available flight experiences
- View service details and pricing
- Contact via WhatsApp
- Company information and location

### User Features
- User registration and authentication
- Book flight experiences
- View booking history
- Track booking status (Pending/Approved/Rejected)
- Profile management

### Admin Features
- Admin dashboard with statistics
- Manage bookings (view, approve, reject)
- Manage services (add, edit, delete, update prices)
- View booking details and customer information

## Technology Stack

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend:** Supabase (PostgreSQL, Authentication, Real-time)
- **Deployment:** Netlify/Vercel (Frontend), Supabase Cloud (Backend)

## Project Structure

```
flight/
├── index.html              # Homepage
├── services.html           # Services listing
├── about.html              # About/Contact page
├── login.html              # User login
├── signup.html             # User registration
├── dashboard.html           # User dashboard
├── booking.html            # Booking form
├── admin/
│   ├── index.html          # Admin dashboard
│   ├── bookings.html       # Bookings management
│   └── services.html       # Services management
├── css/
│   └── style.css           # Main stylesheet
├── js/
│   ├── config.js           # Supabase configuration
│   ├── utils.js            # Utility functions
│   ├── main.js             # App initialization
│   ├── auth.js             # Authentication
│   ├── services.js         # Services API
│   ├── bookings.js         # Bookings API
│   └── admin.js            # Admin functions
└── assets/
    └── images/             # Image assets
```

## Setup Instructions

### 1. Supabase Setup

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and anon key from Settings > API
4. Update `js/config.js` with your Supabase credentials

### 2. Database Setup

Run the following SQL in your Supabase SQL Editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table
CREATE TABLE services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    duration TEXT NOT NULL,
    image_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    service_id UUID REFERENCES services(id) NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    participants INTEGER NOT NULL CHECK (participants > 0),
    total_price DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies (add your policies here)
-- See Supabase documentation for RLS policy setup
```

### 3. Environment Configuration

Update `js/config.js`:
```javascript
const SUPABASE_URL = 'your-supabase-url';
const SUPABASE_ANON_KEY = 'your-supabase-anon-key';
```

### 4. Local Development

1. Open the project in a code editor
2. Use a local server (e.g., Live Server in VS Code, or Python's `http.server`)
3. Open `index.html` in your browser

### 5. Deployment

#### Frontend (Netlify/Vercel)
1. Push code to GitHub
2. Connect repository to Netlify or Vercel
3. Deploy (no build step needed)

#### Backend
- Supabase handles backend automatically
- No additional deployment needed

## Usage

### Creating Admin User

1. Sign up a user through the website
2. In Supabase dashboard, go to Authentication > Users
3. Find the user and note their ID
4. In SQL Editor, run:
```sql
UPDATE profiles SET role = 'admin' WHERE id = 'user-id-here';
```

### Adding Services

1. Log in as admin
2. Go to Admin > Services
3. Click "Add New Service"
4. Fill in details and save

## Notes

- All authentication and database operations use Supabase
- The code includes placeholder functions that need to be connected to Supabase
- Replace all `TODO` comments with actual Supabase implementations
- Test thoroughly before deploying to production

## License

Copyright 2024 One Day Pilot. All rights reserved.

