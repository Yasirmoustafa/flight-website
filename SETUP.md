# Setup Guide - Flight Booking System

## Quick Start

### 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **Settings** > **API**
4. Copy your:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public key** (starts with `eyJ...`)

### 2. Update Configuration

Open `js/config.js` and replace:
```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

With your actual Supabase credentials:
```javascript
const SUPABASE_URL = 'https://xxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

### 3. Database Setup

In your Supabase dashboard, go to **SQL Editor** and run this SQL:

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

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for services (public read, admin write)
CREATE POLICY "Anyone can view active services" ON services
    FOR SELECT USING (active = true);

CREATE POLICY "Admins can view all services" ON services
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can insert services" ON services
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update services" ON services
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can delete services" ON services
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- RLS Policies for bookings
CREATE POLICY "Users can view own bookings" ON bookings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings" ON bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update bookings" ON bookings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );
```

### 4. Create Admin User

1. Sign up a user through the website (`signup.html`)
2. In Supabase dashboard, go to **Authentication** > **Users**
3. Find the user you just created and copy their **User UID**
4. Go to **SQL Editor** and run:
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'PASTE_USER_UID_HERE';
```

### 5. Add Sample Services (Optional)

In **SQL Editor**, run:
```sql
INSERT INTO services (name, description, price, duration, active) VALUES
('One Day Pilot', 'Experience flying an airplane in a real aircraft', 500.00, '2 hours', true),
('Flight Simulator', 'Learn to fly in our state-of-the-art flight simulator', 300.00, '1.5 hours', true),
('Skydive Malaysia', 'Fulfill your bucket list with an amazing skydiving experience', 800.00, 'Half day', true),
('Amazing Helicopter', 'Once you have tasted flight, you will forever walk the earth with your eyes turned skyward', 600.00, '1 hour', true),
('Seaplane Flight Experience', 'Amazing fun activities with seaplane flight', 700.00, '2 hours', true),
('Tandem Parachute', 'Feel the breathtaking adventure and exotic beauty of nature', 750.00, 'Half day', true);
```

### 6. Test the Website

1. Open `index.html` in your browser (or use a local server)
2. Try signing up a new user
3. Log in and create a booking
4. Log in as admin and manage bookings/services

## Troubleshooting

### Supabase not initialized error
- Make sure you've updated `js/config.js` with your credentials
- Check browser console for errors
- Verify your Supabase project is active

### Can't sign up/login
- Check Supabase dashboard > Authentication > Settings
- Make sure email authentication is enabled
- Check browser console for specific error messages

### Can't see bookings/services
- Verify RLS policies are set up correctly
- Check that you're logged in
- Verify data exists in Supabase tables

### Admin features not working
- Make sure you've set your user role to 'admin' in the profiles table
- Log out and log back in after changing role

## Next Steps

- Add real service images
- Customize colors/branding in `css/style.css`
- Deploy to Netlify/Vercel
- Set up custom domain

