# Al-Ameen Diagnostic - Setup Guide

Complete step-by-step guide to set up the project from scratch.

## Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Text editor (VS Code recommended)
- Supabase account (free tier)
- Basic knowledge of HTML/CSS/JavaScript

## Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/al-ameen-diagnostic.git
cd al-ameen-diagnostic
```

## Step 2: Supabase Setup

### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up / Log in
3. Click "New Project"
4. Fill in details:
   - Name: `al-ameen-diagnostic`
   - Database Password: (strong password)
   - Region: Asia (Mumbai) or closest to you
   - Pricing: Free

### 2.2 Run Database Migrations

1. Go to SQL Editor in Supabase Dashboard
2. Run all SQL scripts from `docs/DATABASE_SCHEMA.md` in order:
   - Create tables
   - Enable RLS
   - Create policies
   - Create functions and triggers

### 2.3 Create Storage Buckets

1. Go to Storage in Supabase Dashboard
2. Create three buckets:
   - `reports` (Private)
   - `doctors` (Public)
   - `tests` (Public)

3. Run storage policies from `docs/DATABASE_SCHEMA.md`

### 2.4 Get API Credentials

1. Go to Settings → API
2. Copy:
   - Project URL
   - `anon/public` key (NOT service_role)

## Step 3: Configure the Project

### 3.1 Update Supabase Configuration

Open `js/config/supabase.js` and replace:
```javascript
const SUPABASE_URL = 'YOUR_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
```

### 3.2 Update Clinic Information

Edit `translations/en.json` and `translations/bn.json` with your clinic details.

## Step 4: Run Locally

### Option 1: Live Server (VS Code)

1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

### Option 2: Python
```bash
python -m http.server 8000
```

Open `http://localhost:8000`

### Option 3: Node.js
```bash
npx serve
```

## Step 5: Create Admin Account

1. Open the website
2. Go to Login page
3. Sign up with your email
4. Go to Supabase Dashboard → Authentication → Users
5. Copy your User UID
6. Go to SQL Editor and run:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'YOUR_USER_UID';
```

## Step 6: Initial Data Setup

### Add Doctors

1. Login as admin
2. Go to Admin Dashboard
3. Navigate to "Manage Doctors"
4. Click "Add Doctor"
5. Fill in details and save

### Add Tests

1. Go to "Manage Tests"
2. Click "Add Test"
3. Fill in details including pricing
4. Save

### Create Coupons (Optional)

1. Go to "Manage Coupons"
2. Click "Add Coupon"
3. Set discount type and value
4. Save

## Step 7: Test the System

### Test Patient Flow

1. Logout from admin
2. Sign up as a new patient
3. Book an appointment
4. Note the Booking ID and Serial Number

### Test Lab Flow

1. Create a lab user in Supabase:
```sql
INSERT INTO public.profiles (id, role, full_name)
VALUES ('USER_UID', 'lab', 'Lab Staff Name');
```

2. Login as lab staff
3. Search for the booking
4. Update status

### Test Reports

1. As lab, upload a report
2. As patient, view/download report

## Step 8: Deployment

### GitHub Pages
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

Enable GitHub Pages in repository settings.

### Netlify

1. Connect repository to Netlify
2. Deploy automatically

### Vercel
```bash
vercel
```

## Troubleshooting

### Issue: Login not working

**Solution:** Check Supabase Auth settings:
- Email provider is enabled
- Site URL is set correctly

### Issue: Images not loading

**Solution:** Check storage bucket policies are created.

### Issue: Booking fails

**Solution:** 
- Verify all tables exist
- Check RLS policies
- Ensure triggers are created

### Issue: Dark mode not working

**Solution:** Clear browser cache and reload.

## Security Checklist

- [ ] Changed default Supabase credentials
- [ ] RLS enabled on all tables
- [ ] Storage policies configured
- [ ] Admin account secured
- [ ] Guest booking validation working
- [ ] HTTPS enabled in production

## Next Steps

1. Customize colors in `css/variables.css`
2. Add your clinic logo to `assets/images/logo/`
3. Update contact information
4. Add real doctor and test data
5. Test all features thoroughly

## Support

If you encounter issues, check:
- Browser console for JavaScript errors
- Supabase dashboard for database errors
- Network tab for API call failures

For additional help, create an issue on GitHub.