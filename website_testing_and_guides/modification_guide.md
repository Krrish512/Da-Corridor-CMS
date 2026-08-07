# Site Customization & Modification Guide
This guide provides clear, step-by-step instructions on how to modify the site's logo, branding names, photos, and database schema/data.

---

## 1. Modifying the Website Logo

### Method A: Direct Code Modification (Quickest)
The logo mark (`A` icon) and text branding (`DA' CORRIDOR`) are currently hardcoded in the frontend navbar layout.
1. Open [ClientLayout.jsx](file:///d:/Da’ Corridor/frontend/src/pages/client/ClientLayout.jsx).
2. Go to lines **75 to 82**:
   ```jsx
   <Link to="/" className="flex items-center gap-3">
     <div className="h-9 w-9 bg-neutral-900 dark:bg-white flex items-center justify-center rounded-sm">
       <span className="text-white dark:text-black font-extrabold text-lg tracking-widest font-display">A</span>
     </div>
     <span className="text-xl font-bold tracking-wider font-display bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent">
       DA' CORRIDOR
     </span>
   </Link>
   ```
3. To replace the `A` block with an image logo:
   - Save your logo file (e.g., `logo.png`) inside `frontend/src/assets/` or `backend/uploads/`.
   - Replace the `<div className="h-9 w-9 ...">` block with an `<img>` tag:
     ```jsx
     <img src="/src/assets/logo.png" alt="Logo" className="h-9 w-auto object-contain" />
     ```

### Method B: Database Dynamic Logo (Via Admin Portal)
1. Log into the Admin CMS Panel (`/admin/dashboard`).
2. Navigate to **System Configuration** (`/admin/settings`).
3. Click the **Global Settings** tab.
4. Input the image URL in the **Website Logo (URL)** or **Favicon File (URL)** inputs.
5. Click **Save Settings**.
6. *Optional:* To consume this logo dynamically on the public pages, modify [ClientLayout.jsx](file:///d:/Da’ Corridor/frontend/src/pages/client/ClientLayout.jsx) to fetch system settings from the `/api/settings` endpoint and replace the hardcoded header elements with:
   ```jsx
   <img src={systemSettings?.websiteLogo || '/fallback-logo.png'} alt="Logo" />
   ```

---

## 2. Modifying the Website Name & Titles

### 2.1 Main Branding Name (Header & Footer)
The name `DA' CORRIDOR` is rendered in two primary frontend components:
- **Navbar Header:** [ClientLayout.jsx](file:///d:/Da’ Corridor/frontend/src/pages/client/ClientLayout.jsx) around line 80:
  ```jsx
  <span className="text-xl font-bold ...">DA' CORRIDOR</span>
  ```
- **Footer Text:** Rendered dynamically based on your **Footer Copyright Text** settings in the CMS Settings tab.

### 2.2 Browser Tab Titles
The browser tab text is updated dynamically using a routing map in React.
1. Open [ClientLayout.jsx](file:///d:/Da’ Corridor/frontend/src/pages/client/ClientLayout.jsx).
2. Find the `titleMap` variable around lines **29 to 37**:
   ```javascript
   const titleMap = {
     '/': 'Da\' Corridor | Architecture & Spatial Design',
     '/about': 'About Us | Da\' Corridor',
     '/services': 'Our Services | Da\' Corridor',
     '/portfolio': 'Portfolio | Da\' Corridor',
     '/comments': 'Client Testimonials | Da\' Corridor',
     '/contact': 'Contact Us | Da\' Corridor',
     '/blog': 'Blog & FAQ | Da\' Corridor',
   };
   ```
3. Replace `'Da\' Corridor'` with your desired brand name for each page route.

### 2.3 Search Engine Browser Title (SEO Meta Tags)
1. Navigate to the Admin Portal -> **System Configuration** -> **SEO Configurations** tab.
2. Update the **Homepage Browser Title** and **Meta Description** values.
3. Click **Save Settings** to persist the details to the `SEOSettings` table in the database.

---

## 3. Modifying Photos & Media Assets

All project photos, profiles, and slider media can be managed in two ways:

### Method A: Central Upload via Media Library (Recommended)
1. Go to the Admin Dashboard and select **Media Library**.
2. Click **Add Media** to upload images from your local system.
3. Once uploaded, copy the resulting file URL (e.g. `/uploads/170000000_image.jpg`).
4. Paste this URL into any photo input field (such as Project cover image, team member profile, or service icon).

### Method B: Manual File System Upload
If you have static brand photos you want to serve directly:
1. Paste the photo files in the backend's local uploads directory: [backend/uploads](file:///d:/Da’ Corridor/backend/uploads)
2. You can reference them inside your frontend components or CMS fields via:
   `http://localhost:5000/uploads/YOUR_IMAGE_NAME.jpg` (Replace `YOUR_IMAGE_NAME.jpg` with the actual filename).

---

## 4. Database Customization (Prisma & PostgreSQL)

### 4.1 Connecting to the Database Directly
1. Make sure your Docker container is running by typing:
   ```bash
   docker-compose up -d
   ```
2. Open your web browser and navigate to the **Adminer** database client:
   `http://localhost:8080`
3. Enter the connection credentials:
   - **System:** `PostgreSQL`
   - **Server:** `postgres`
   - **Username:** `postgres`
   - **Password:** `postgres`
   - **Database:** `arch_cms`
4. Here you can browse database tables, modify cells manually, delete rows, or run custom SQL commands.

### 4.2 Editing Database Configuration (.env)
The environment configurations reside in [backend/.env](file:///d:/Da’ Corridor/backend/.env).
```ini
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/arch_cms?schema=public"
JWT_SECRET="arch_studio_ultra_secret_key_2024"
PORT=5000
```
Change the connection credentials here if you migrate to a production database (like AWS RDS, Supabase, or Render PostgreSQL).

### 4.3 Modifying the Database Schema (Tables/Models)
If you need to add new fields (e.g., a "phone number" field to the team member profile or "client cost" to projects):
1. Open the Prisma schema file: [schema.prisma](file:///d:/Da’ Corridor/backend/prisma/schema.prisma)
2. Add your new field column under the respective model. E.g.:
   ```prisma
   model TeamMember {
     id      String  @id @default(uuid())
     name    String
     phone   String? // Newly added optional column
     ...
   }
   ```
3. Open a terminal and run a Prisma migration to apply your changes to the PostgreSQL database and update the Prisma Client queries:
   ```bash
   cd backend
   npx prisma migrate dev --name add_phone_to_team
   ```

### 4.4 Modifying Seed/Default Data
To change the default admin password, default services, or default portfolios generated during initial setup:
1. Edit the seed script: [seed.js](file:///d:/Da’ Corridor/backend/prisma/seed.js)
2. To apply the seed changes and re-populate the database, execute:
   ```bash
   cd backend
   npm run prisma:seed
   ```
   *(Note: This seed script is non-destructive, but check that it won't overwrite existing tables if customized logic is changed).*
