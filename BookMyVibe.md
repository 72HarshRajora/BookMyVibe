
---

# 1. TECH STACK

* Frontend: React.js (with Vite)
* Backend: Node.js + Express.js
* Database: MongoDB (Mongoose)
* Authentication: JWT (stored in cookies)
* Email: Nodemailer (Gmail SMTP)
* Image Storage: Cloudinary
* Architecture: MVC

---

# 2. UI REQUIREMENTS (STRICT)

* DO NOT use Tailwind
* Use **pure CSS3 (external CSS)**
* Create folder: **/styles**
* Dark theme aesthetic UI with:

  * 2–3 gradient color combinations
  * Glassmorphism effects
  * Smooth hover animations

---

# 3. RESPONSIVENESS

* Fully responsive (desktop, tablet, mobile)
* Mobile font size must be **10–15% smaller**
* Use media queries
* Navbar → hamburger menu on mobile

---

# 4. USER ROLES (VERY IMPORTANT)

## 1. User

## 2. Vendor (Event Manager)

## 3. Admin

---

# 5. USER FEATURES

* Signup + OTP verification
* Login (JWT in cookies)
* View all events/vendors
* View vendor details:

  * vendor name
  * event price
  * description
  * image
* Book event
* Enter:

  * phone number
  * address (3 inputs):

    * Address Line (H.No, Building)
    * Area/Colony/Society
    * City + State
* Edit booking after creation
* Receive **Booking Confirmation Email**

---

# 6. VENDOR FEATURES (CORE PART)

* Signup as Vendor
* Login
* Create events/services:

  * title
  * description
  * price
  * category (DJ, Food Stall, Decorator, Lighting etc.)
  * availability (date/time)
  * image upload (Cloudinary)
* Update event
* Delete event
* View all their bookings
* Receive email when booking is confirmed with:

  * user name
  * phone
  * event date/time/place

---

# 7. ADMIN PANEL (VERY IMPORTANT)

## Dashboard:

* Total Users count
* Total Vendors count
* Total Bookings

---

## Sections:

### 🔹 View All Users

### 🔹 View All Vendors

Each section must have:

* Table UI
* Search bar (search by name/email)
* Lazy data fetching (only fetch when page opens)

---

## Table Features:

* Show only **15 rows initially**
* “View More” button → load next 15 rows
* Search should work on full dataset (server-side search)
* Click row → open profile view

---

## Profile View (User/Vendor)

### User Profile:

* Name
* Email
* Total bookings
* Booking history

### Vendor Profile:

* Name
* Email
* Events created
* Total bookings received

---

## Admin Controls:

* Delete user/vendor
* Modify user/vendor data
* View all bookings of:

  * specific user
  * specific vendor

---

# 8. ADMIN SIGNUP SECURITY

* Admin signup option available
* Before creating admin:

  * Send OTP to this email: **[72harshrajora@gmail.com](mailto:72harshrajora@gmail.com)**
  * Only if OTP verified → allow admin signup
  * Else redirect to user signup

---

# 9. DATABASE MODELS

Create models:

* User (role: user/vendor/admin)
* Event
* Booking
* OTP

Include:

* hashed password
* role-based fields
* booking references
* vendor references

---

# 10. CLOUDINARY IMAGE STORAGE

## Requirements:

* Upload images using multer
* Store in Cloudinary
* Save image URL in DB

---

## .env.example must include:

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

---

# 11. EMAIL SYSTEM (VERY IMPORTANT)

## Use Nodemailer with Gmail SMTP

---

## Emails to implement:

### 1. OTP Email

* Signup verification
* Booking verification

### 2. Booking Confirmation Email (User)

Include:

* Event name
* Date
* Time
* Place

### 3. Vendor Notification Email

Include:

* User name
* Phone number
* Address
* Event details

---

# 12. GMAIL APP PASSWORD SETUP (INCLUDE IN README)

Explain:

1. Enable 2-Step Verification
2. Generate App Password
3. Store in `.env`

---

# 13. BOOKING FLOW

User → select event → fill details → OTP verify → booking created
→ confirmation email to user
→ notification email to vendor

---

# 14. BOOKING EDIT FEATURE

* User can update:

  * address
  * date/time
* Validate before updating

---

# 15. API DESIGN

* Auth routes
* Vendor routes
* Event routes
* Booking routes
* Admin routes

Use middleware:

* auth middleware
* role-based middleware

---

# 16. PROJECT STRUCTURE

Include:

* MVC structure (backend)
* Separate client folder
* styles folder for CSS
* utils for email/cloudinary

---

# 17. FINAL REQUIREMENTS

* Clean code
* Proper error handling
* Loading states
* Toast notifications
* Secure APIs
* Fully functional end-to-end system

---

# FINAL GOAL

Build a **complete production-ready platform** with:

* Multi-role system
* Vendor marketplace
* Admin dashboard
* Image upload (Cloudinary)
* Email automation
* Responsive aesthetic UI

---
