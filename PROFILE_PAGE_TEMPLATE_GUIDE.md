# 🎨 Director Profile Page Template Guide

## 📌 Quick Start - Copy Wachanga's Template!

Wachanga's profile page is now **complete** and serves as the **template** for everyone to follow!

**View the example:**
- HTML: `pages/directors/wachanga.html`
- CSS: `css/directors/wachanga.css`
- Live Demo: Open `pages/directors/wachanga.html` in your browser

### 🏥 **IMPORTANT: Use Pharmacy-Themed Roles!**

Remember, we're building **Pharmacare** - a pharmaceutical platform! Your titles and responsibilities should reflect **pharmacy and healthcare** themes, not generic tech roles.

✅ **Good Examples:**
- "Director of Pharmacy Operations" (not "Admin Panel Manager")
- "Chief Pharmacy Compliance Officer" (not "Authentication Developer")
- "Prescription Database Management" (not "Database Design")

❌ **Avoid Generic Tech Terms:**
- Avoid: "Full-Stack Developer", "Software Engineer", "Code Manager"
- Use: Clinical, Pharmacy, Patient, Prescription, Medication, Healthcare themes

---

## 🚀 How to Build Your Profile Page (Step-by-Step)

### **Step 1: Copy the HTML Structure**

Open `pages/directors/wachanga.html` and copy these sections to your own HTML file:

1. **Hero Section** - Your name, title, photo, status badge
2. **About Section** - Your bio and background
3. **Responsibilities Section** - What you're building (6 cards)
4. **Technologies Section** - Tools and tech you're using
5. **Achievements Section** - Your progress stats
6. **Skills Section** - Your competency bars
7. **Contact Section** - Your social links

### **Step 2: Customize the Content**

Edit these parts in **YOUR HTML file**:

```html
<!-- Change these to YOUR information -->
<h1 class="hero-title">Your Name Here</h1>
<p class="hero-subtitle">Your Role Title</p>
<p class="hero-description">Your expertise description</p>

<!-- Update social links -->
<a href="https://github.com/YOUR-USERNAME" class="social-btn github">
    <i class="fab fa-github"></i>
</a>
```

#### **For Sharine (Admin Panel Director):**

**Pharmacy Role:** Director of Pharmacy Operations & Clinical Analytics

**Responsibilities Cards (6 cards):**
1. **Medication Inventory Management** - CRUD operations for pharmaceutical products and stock control
2. **Prescription Order Management** - View and update prescription fulfillment status and tracking
3. **Patient Account Management** - Manage patient profiles and pharmacy staff access controls
4. **Clinical Analytics Dashboard** - Revenue tracking, prescription metrics, medication statistics
5. **Pharmacy Data Security** - Admin access control and HIPAA compliance monitoring
6. **Regulatory Reporting System** - Export clinical data and compliance reports

**Technologies to list:**
- Supabase EHR Database
- JavaScript ES6+
- Pharmacy Admin Panel UI
- Clinical Data CRUD
- Healthcare Analytics
- Prescription Validation

**Skills bars (adjust percentages):**
- Pharmacy Operations Management: 85%
- Clinical Database CRUD: 80%
- Healthcare Form Handling: 90%
- Medication Data Management: 85%
- Pharmacy UI/UX Design: 75%
- JavaScript & APIs: 80%

### **Step 3: Copy and Customize the CSS**

Open `css/directors/wachanga.css` and:

1. **Copy the ENTIRE file** to your CSS file
2. **Change the color gradients** (optional):

```css
/* Your custom colors */
:root {
    --primary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    /* Change these hex colors to your favorite colors! */
}
```

3. **Customize card icon colors**:

```css
.card-icon.your-custom-name {
    background: linear-gradient(135deg, #YOUR-COLOR-1, #YOUR-COLOR-2);
}
```

---

## 🎨 Customization Ideas

### **Color Schemes:**

**Professional Blue:**
```css
--primary-gradient: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
```

**Energetic Pink:**
```css
--primary-gradient: linear-gradient(135deg, #ec4899 0%, #be185d 100%);
```

**Fresh Green:**
```css
--primary-gradient: linear-gradient(135deg, #10b981 0%, #059669 100%);
```

**Warm Orange:**
```css
--primary-gradient: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
```

### **Profile Image Options:**

**Option 1: Use Your Photo from Cloudinary (Recommended - See Wachanga's example)**
```html
<div class="profile-image" style="background-image: url('YOUR-CLOUDINARY-URL-HERE'); background-size: cover; background-position: center;"></div>
```
*Upload your photo to Cloudinary and paste the URL*

**Option 2: Use Your Photo from assets folder**
```html
<div class="profile-image" style="background-image: url('../../assets/images/your-photo.jpg'); background-size: cover; background-position: center;"></div>
```

**Option 3: Use an Icon**
```html
<div class="profile-image">
    <i class="fas fa-user-md"></i>
</div>
```

**Option 4: Use Your Initials**
```html
<div class="profile-image" style="font-size: 3rem; font-weight: 800;">
    SM  <!-- Your initials -->
</div>
```

---

## 📋 Section-by-Section Guide

### **1. Hero Section** (Top banner with your name)

**What to change:**
- Your name
- Your title/role
- Your tagline
- Social media links (GitHub, LinkedIn, Email)
- Status badge text

### **2. About Section**

**Write 2-3 paragraphs about:**
- Who you are
- What you're passionate about
- Your role in the project
- What you're learning

### **3. Responsibilities Section** (6 cards)

**List your 6 main tasks from the assignment doc:**

Example format:
```html
<div class="responsibility-card">
    <div class="card-icon database">
        <i class="fas fa-database"></i> <!-- Pick an icon -->
    </div>
    <h3 class="card-title">Your Task Title</h3>
    <p class="card-description">
        What you're building and why it matters
    </p>
</div>
```

**Icon suggestions:**
- `fa-database` - Database stuff
- `fa-shopping-cart` - Cart features
- `fa-credit-card` - Payment/checkout
- `fa-shield-alt` - Security/auth
- `fa-cogs` - Admin panel
- `fa-chart-line` - Analytics
- `fa-users` - User management

### **4. Technologies Section**

**List the tools you're using:**
- Frontend: HTML, CSS, JavaScript
- Backend: Supabase
- Version Control: Git, GitHub
- Your specific tech related to your role

### **5. Achievements Section** (4 stat cards)

**Show your progress:**
- Tasks completed
- Features implemented
- Lines of code written
- Pages created

### **6. Skills Section** (Progress bars)

**List 6 skills with percentages:**
- Be honest but confident!
- You can use 70-95% range
- List technical and soft skills

### **7. Contact Section**

**Update your contact info:**
- Email
- GitHub username
- LinkedIn profile
- Portfolio website (if you have one)

---

## 🔥 Pro Tips

### **1. Use Font Awesome Icons**

Already included! Just use any icon from: https://fontawesome.com/icons

```html
<i class="fas fa-heart"></i>
<i class="fas fa-rocket"></i>
<i class="fas fa-star"></i>
```

### **2. Keep Content Professional**

✅ Good:
- "Passionate about building secure authentication systems"
- "Experienced in React and modern web development"
- "Detail-oriented problem solver"

❌ Avoid:
- Spelling errors
- Unprofessional language
- Negative statements

### **3. Make It Personal**

- Use "I" language (I build, I create, I design)
- Share your learning journey
- Highlight your unique skills
- Show your personality!

### **4. Test Responsiveness**

- Open your page in browser
- Resize the window (make it narrow)
- Check on your phone
- Make sure everything looks good!

### **5. Update Regularly**

As you complete tasks, update:
- Your achievements numbers
- Your skills percentages
- Your responsibilities descriptions

---

## 📱 Responsive Design

The template is **already mobile-friendly**! It automatically adjusts for:
- Desktop (1920px)
- Laptop (1366px)
- Tablet (768px)
- Mobile (480px)

Test by resizing your browser window.

---

## 🎯 For Each Team Member

### **Sharine (Admin Panel):**
- **Pharmacy Title:** Director of Pharmacy Operations & Clinical Analytics
- Icon: `fa-user-shield` or `fa-clipboard-list`
- Color: Purple or Blue gradient
- Focus: Medication inventory, prescription orders, clinical analytics

### **Innocent (Authentication):**
- **Pharmacy Title:** Chief Pharmacy Compliance Officer
- Icon: `fa-lock` or `fa-shield-alt`
- Color: Blue or Dark purple
- Focus: Patient identity verification, prescription authentication, secure access

### **Isabell (Products):**
- **Pharmacy Title:** Director of Pharmaceutical Product Catalog
- Icon: `fa-pills` or `fa-capsules`
- Color: Pink or Teal
- Focus: Medication catalog, drug information, product search

### **Obuya (Cart):**
- **Pharmacy Title:** Director of Prescription Cart Management
- Icon: `fa-shopping-cart` or `fa-prescription-bottle-alt`
- Color: Green or Orange
- Focus: Prescription cart, medication quantities, patient orders

### **Samuel (Checkout):**
- **Pharmacy Title:** Director of Prescription Processing & Payment
- Icon: `fa-credit-card` or `fa-file-prescription`
- Color: Green or Blue
- Focus: Payment processing, prescription fulfillment, order confirmation

### **Techwizbiz (Components):**
- **Pharmacy Title:** Director of Digital Pharmacy Interface
- Icon: `fa-puzzle-piece` or `fa-laptop-medical`
- Color: Rainbow or Multi-color
- Focus: Reusable UI components, pharmacy portal design

### **Titus (Testing):**
- **Pharmacy Title:** Director of Clinical Quality Assurance
- Icon: `fa-vial` or `fa-stethoscope`
- Color: Red or Orange
- Focus: System testing, quality control, clinical validation

### **Vikitar (Reviews):**
- **Pharmacy Title:** Director of Patient Feedback & Medication Reviews
- Icon: `fa-star` or `fa-comments-medical`
- Color: Yellow or Gold
- Focus: Patient reviews, medication ratings, feedback systems

### **Washington (Static Pages):**
- **Pharmacy Title:** Director of Patient Education & Support
- Icon: `fa-book-medical` or `fa-info-circle`
- Color: Blue or Gray
- Focus: Patient education pages, contact support, medication information

---

## ✅ Checklist Before You Submit

- [ ] Changed all personal information (name, title, bio)
- [ ] Updated all 6 responsibility cards
- [ ] Listed your technologies
- [ ] Added your achievements (can be in progress)
- [ ] Set your skill percentages
- [ ] Updated social media links
- [ ] Tested page in browser
- [ ] Checked mobile view
- [ ] No spelling errors
- [ ] Profile looks professional

---

## 🆘 Need Help?

1. **Look at Wachanga's page** - It's your reference!
2. **Copy the structure** - Don't start from scratch
3. **Change content gradually** - One section at a time
4. **Test frequently** - Check in browser after each change
5. **Ask the team** - We're here to help!

---

## 🎉 Remember

Your profile page is:
- ✅ **Your digital portfolio**
- ✅ **Showcase of your work**
- ✅ **Part of your project contribution**
- ✅ **Something to be proud of!**

**Take your time, be creative, and make it awesome!** 🚀

---

*Template created by: Wachanga*  
*Last updated: February 13, 2026*
