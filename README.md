# Al-Ameen Diagnostic Center - Website

A modern, full-stack medical diagnostic center website with appointment booking, patient management, and admin dashboard.

## 🏥 Features

### Patient Features
- 🔐 Login/Signup with email
- 📅 Online appointment booking
- 👤 Guest booking (no login required)
- 🎟️ Unique booking ID and serial number system
- 📊 View appointment history
- 📄 Download medical reports
- 🔔 In-app notifications
- 💰 Apply coupon codes

### Lab Staff Features
- 🔍 Search appointments by booking ID
- ✅ Update appointment status (check-in, complete)
- 📤 Upload patient reports
- ⏰ Edit doctor/test schedules
- 📋 View today's appointments

### Admin Features
- 👨‍⚕️ Manage doctors (add, edit, activate/deactivate)
- 🧪 Manage diagnostic tests (add, edit, pricing)
- 🎫 Create and manage coupon codes
- 📊 View analytics and statistics
- 📝 Audit logs
- ⚙️ Clinic settings management
- 👥 User management

### Additional Features
- 🌐 Bilingual support (English & Bengali)
- 🌓 Dark/Light theme toggle
- 📱 Fully responsive design
- ♿ Accessible
- 🎨 Modern teal medical theme
- ✨ Smooth animations and transitions
- 🖼️ Image galleries with swiper
- 🔒 Secure authentication with Supabase

## 🛠️ Tech Stack

### Frontend
- HTML5
- CSS3 (Custom + Bootstrap 5)
- Vanilla JavaScript
- Bootstrap 5.3
- Font Awesome 6.4
- AOS (Animate On Scroll)
- Swiper.js

### Backend
- Supabase (PostgreSQL database)
- Supabase Auth
- Supabase Storage

### APIs & Libraries
- Supabase JS SDK
- Chart.js (for analytics)

## 📁 Project Structure
```
al-ameen-diagnostic/
├── index.html                  # Homepage
├── about.html                  # About page
├── doctors.html                # Doctors listing
├── doctor-detail.html          # Doctor profile
├── tests.html                  # Tests listing
├── test-detail.html            # Test details
├── departments.html            # Departments
├── booking.html                # Appointment booking
├── booking-confirmation.html   # Booking success
├── track-booking.html          # Track appointment
├── login.html                  # Login/Signup
├── forgot-password.html        # Password reset
├── contact.html                # Contact page
├── faq.html                    # FAQs
├── gallery.html                # Image gallery
├── blog.html                   # Health tips
├── privacy-policy.html         # Privacy policy
├── terms.html                  # Terms & conditions
├── 404.html                    # Error page
├── dashboards/                 # Dashboard pages
│   ├── patient/               # Patient dashboard
│   ├── lab/                   # Lab dashboard
│   └── admin/                 # Admin dashboard
├── css/                        # Stylesheets
├── js/                         # JavaScript files
│   ├── config/                # Configuration
│   ├── utils/                 # Utility functions
│   ├── core/                  # Core functionality
│   ├── features/              # Feature modules
│   ├── components/            # UI components
│   └── dashboards/            # Dashboard logic
├── assets/                     # Static assets
│   ├── images/                # Images
│   ├── videos/                # Videos
│   └── animations/            # Lottie animations
├── translations/               # Language files
│   ├── en.json                # English
│   └── bn.json                # Bengali
└── docs/                       # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser
- Supabase account (free tier)
- Text editor (VS Code recommended)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/al-ameen-diagnostic.git
cd al-ameen-diagnostic
```

2. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL migrations from `docs/SETUP.md`
   - Create storage buckets: `reports`, `doctors`, `tests`

3. **Configure credentials**
   - Open `js/config/supabase.js`
   - Replace with your Supabase URL and anon key

4. **Run locally**
   - Use a local server (Live Server extension in VS Code)
   - Or use Python: `python -m http.server 8000`
   - Or Node.js: `npx serve`

5. **Open in browser**
   - Navigate to `http://localhost:8000` (or your port)

## 📊 Database Schema

See `docs/DATABASE_SCHEMA.md` for complete database structure.

### Main Tables
- `profiles` - User profiles with roles
- `doctors` - Doctor information
- `tests` - Diagnostic tests
- `appointments` - Appointment bookings
- `reports` - Medical reports
- `coupons` - Discount coupons
- `audit_logs` - Activity tracking
- `clinic_settings` - Clinic configuration

## 🎨 Customization

### Colors
Edit `css/variables.css` to change the color scheme:
```css
--primary: #4ECDC4;        /* Main teal color */
--secondary: #44A08D;      /* Secondary green */
--accent: #FF6B6B;         /* Accent coral */
```

### Languages
Add/edit translations in:
- `translations/en.json`
- `translations/bn.json`

### Logo
Replace images in `assets/images/logo/`

## 🔐 Security Features

- Row Level Security (RLS) on all tables
- Role-based access control
- Secure file storage
- Password hashing (Supabase Auth)
- Guest booking validation
- Audit logging

## 📱 Deployment

### GitHub Pages
```bash
git add .
git commit -m "Initial commit"
git push origin main
# Enable GitHub Pages in repository settings
```

### Netlify
```bash
# Connect repository to Netlify
# Deploy automatically on push
```

### Vercel
```bash
vercel
# Follow prompts
```

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Bootstrap team
- Supabase team
- Font Awesome
- AOS library
- Swiper.js

## 📞 Support

For support, email info@alameendiagnostic.com or open an issue.

## 🗺️ Roadmap

- [ ] WhatsApp integration
- [ ] Email notifications
- [ ] Payment gateway integration
- [ ] Mobile app (React Native)
- [ ] Telemedicine features
- [ ] Prescription management
- [ ] Lab reports OCR

## 📈 Version History

- **v1.0.0** (January 2025) - Initial release
  - Full appointment booking system
  - Patient/Lab/Admin dashboards
  - Bilingual support
  - Dark mode

---

Made with ❤️ for Al-Ameen Diagnostic Center