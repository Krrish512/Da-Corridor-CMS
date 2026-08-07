# Web Application Testing Checklist
This checklist provides a detailed roadmap for QA and developers to test all features of both the **Public Client Website** and the **Admin CMS Portal**.

---

## 1. Public Client Website Testing

### 1.1 Header & Footer Navigation
- [ ] **Desktop Navigation Links:** Verify that clicking 'Home', 'Services', 'Portfolio', 'Comments', 'About Us', 'Blog & FAQ', and 'Contact' redirects to the correct pages.
- [ ] **Mobile Responsive Menu:** Verify that the hamburger icon opens the mobile sidebar on smaller screens, and links function correctly.
- [ ] **Dark Mode Toggle:** Toggle the sun/moon icon. Verify that the interface switches smoothly between light and dark modes across all pages, and that the preference is stored in `localStorage`.
- [ ] **Portal Login Button:** Verify that the 'Portal Login' button redirects to the admin login page (`/admin/dashboard` or `/admin/login`).
- [ ] **Footer Contact Details:** Verify that the office address, email, phone, and WhatsApp numbers match the values set in the CMS settings.
- [ ] **Social Media Links:** Confirm that clicking social media icons opens the correct links in a new tab.

### 1.2 Home Page
- [ ] **Hero Section:** Check that the background image/video loads, CTA text displays correctly, and the CTA button redirects to the defined link.
- [ ] **Services Preview:** Verify that the top services cards load and link directly to the Services page.
- [ ] **Featured Projects:** Check that marked "featured" projects display correctly.
- [ ] **Testimonials Feed:** Check that only active, approved testimonials display.
- [ ] **Latest Blogs:** Check that the most recent blog posts appear with their respective thumbnail images.

### 1.3 Services Page
- [ ] **Service Cards:** Verify that all dynamic services fetch from the database and show title, icon, short description, and long description.
- [ ] **Responsive Grid:** Check that cards scale correctly on desktop, tablet, and mobile views.

### 1.4 Portfolio Page
- [ ] **Filter Tabs:** Verify that clicking category tabs (e.g., *Residential*, *Commercial*, *Interior*) dynamically filters the project grid.
- [ ] **Project Detail View:** Verify that clicking a project details card opens the project details page/modal showing:
  - Cover image and full description.
  - Location, client name, area size, completion date, and project status.
  - Image gallery carousel/grid.
  - Design challenge, solution, and materials used.

### 1.5 Comments & Testimonials Page
- [ ] **Reviews Feed:** Ensure all user reviews display with correct star ratings (1 to 5 stars).
- [ ] **Feedback Submission Form:** 
  - Fill out the form with a rating, review, and client name.
  - Submit the form and verify the success message.
  - Check that the review **does not** appear immediately on the public site (it must wait for admin approval in the backend).

### 1.6 About Us Page
- [ ] **Profile Information:** Verify the bio, profession, experience counters, and profile photo render correctly.
- [ ] **Achievements Counters:** Verify years of experience, completed projects, happy clients, and awards numbers.
- [ ] **Team Members Grid:** Ensure team members' names, photos, positions, bios, and social links render.
- [ ] **Partner Logos:** Check that the brand logos render and link to their respective corporate sites.

### 1.7 Blog & FAQ Page
- [ ] **Blog Search Bar:** Type a keyword and verify that matching blog posts are filtered instantly.
- [ ] **Tags Filtering:** Click a tag and confirm it filters the blogs list.
- [ ] **FAQ Accordion:** Click on FAQ questions and confirm they expand to show the answer, and close when clicked again.

### 1.8 Contact Page
- [ ] **Map Embed:** Verify that the Google Maps iframe loads.
- [ ] **Contact Form Submission:**
  - Submit an empty form and check for validation errors.
  - Submit a successful message (Name, Email, Phone, Subject, Message) and check for the success notification.
  - Check that a notification email is triggered (if email settings are configured) and that the inquiry is saved in the database.

---

## 2. Admin CMS Portal Testing

### 2.1 Authentication & Route Security
- [ ] **Unauthorized Access Guard:** Attempt to access `/admin/dashboard` or `/admin/settings` directly without logging in. Verify that you are redirected to `/admin/login`.
- [ ] **Login Validation:**
  - Submit invalid email or password and check for errors.
  - Submit default seed credentials (`admin@dacorridor.com` / `admin123`) and verify redirect to the dashboard.
- [ ] **Logout Function:** Click the "Sign Out" button and verify that auth tokens are cleared and you are redirected to the login screen.

### 2.2 Dashboard
- [ ] **Metrics Counters:** Check that total counts for projects, inquiries, active testimonials, and newsletter subscribers match database entries.
- [ ] **Recent Activity / Inquiries:** Verify that recent contact form submissions display in the dashboard feed.

### 2.3 Media Library
- [ ] **File Upload:** Upload an image or video file. Confirm the upload succeeds and it is saved in `/uploads/` local directory.
- [ ] **Filters and Folders:** Verify files can be sorted by folders or type (Image, Video, Logo, Document).
- [ ] **Delete Media:** Delete an item and verify it is removed from both the UI and the server's uploads folder.

### 2.4 Hero & About Section Editors
- [ ] **Hero Details Update:** Edit the main heading, CTA Link, and background image URL. Save and verify changes on the public Home page.
- [ ] **About Profile Update:** Modify biographical text, vision, mission, and years of experience. Save and verify updates on the public About page.

### 2.5 Portfolio Manager
- [ ] **Project Creation:** Create a new project, enter detail fields, select cover image, and upload gallery images. Verify it appears under public Portfolio.
- [ ] **Project Editing:** Modify project details (e.g. change status to "Completed"). Verify it updates.
- [ ] **Soft Delete Project:** Click Delete. Verify it is hidden from the UI but remains in the database with a `deletedAt` timestamp.

### 2.6 Services Management
- [ ] **Add/Edit Service:** Add a service, set display order, and choose an icon. Verify the updated display on the services page.
- [ ] **Toggle Status:** Deactivate a service. Verify it disappears from the public page.

### 2.7 Testimonial, Team, & Partner Management
- [ ] **Approve Testimonial:** View user-submitted feedback. Click "Approve/Activate". Verify it is now visible on the public Comments page.
- [ ] **Team Members CRUD:** Add a team member with a photo URL. Verify representation on the About Us page.
- [ ] **Partner Logo Upload:** Edit or add brand logos and redirect links. Verify logo representation.

### 2.8 Blog & FAQ Management
- [ ] **Create Blog Post:** Write an article, add tags, set a slug, and write body text. Verify it loads on the public Blog list.
- [ ] **FAQ CRUD:** Add a new FAQ. Verify it loads at the bottom of the public Blog & FAQ section.

### 2.9 Inquiries & Newsletter Subscribers
- [ ] **Inbox Management:** View received contact inquiries. Toggle the status between "UNREAD", "READ", and "REPLIED".
- [ ] **Subscriber List:** View email addresses registered for the newsletter. Check if they can be executed or removed.

### 2.10 SEO & System Settings
- [ ] **Contact Info Config:** Change office phone/email. Check client site footer representation.
- [ ] **Maintenance Mode:** Enable maintenance mode. Open the public website in an incognito window and verify that only the under-construction screen shows. Disable it and verify normal access.
- [ ] **SEO Settings:** Change homepage browser title and metadata keywords. Verify they update in the HTML source code.
