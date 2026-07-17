# Architecture Portfolio CMS Admin Panel

A high-end, responsive, and minimalist Content Management System (CMS) designed specifically for an Architecture Portfolio Website. Inspired by premium dashboard layouts like Vercel, Linear, and Notion.

## Technology Stack
- **Frontend**: React.js, Vite, Tailwind CSS, React Router v6, Axios, TanStack Query (React Query), React Hook Form, Recharts, Lucide Icons
- **Backend**: Node.js, Express.js, JWT Authentication, Multer (file upload), Nodemailer
- **Database & ORM**: PostgreSQL, Prisma ORM
- **Deployment & Setup**: Docker Compose (PostgreSQL + Adminer database inspector)

---

## Getting Started

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Docker** & **Docker Compose** (for running PostgreSQL locally)

---

### 2. Database Infrastructure Setup
We have included a `docker-compose.yml` file to spin up a PostgreSQL instance and an Adminer tool automatically.

At the root directory, run:
```bash
docker-compose up -d
```
This spins up:
- **PostgreSQL** database on port `5432`
- **Adminer** database client viewer on `http://localhost:8080` (use System: PostgreSQL, Server: postgres, Username: postgres, Password: postgres, Database: arch_cms)

---

### 3. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Sync environment configurations:
   Check `backend/.env` file. By default, it is preset to connect to the local Dockerized PostgreSQL instance.
4. Execute database migrations and seed the database:
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push schema to database
   npx prisma db push
   
   # Populate default admin and mock portfolios
   
   npm run prisma:seed
   ```
5. Start the API development server:
   ```bash
   npm run dev
   ```
   The backend API will run on `http://localhost:5000`.

---

### 4. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   The CMS panel will run on `http://localhost:5173`.

---

## Administrator Login Credentials
Use the default credentials seeded into the database to log in:
- **Email**: `admin@archstudio.com`
- **Password**: `admin123`

---

## Notable System Implementations

### Soft Delete Strategy
To protect critical portfolios and testimonials, **no hard deletions are executed**.
- All tables feature a `deletedAt` DateTime column.
- Clicking delete sets this column to the current timestamp.
- Read API requests automatically filter out records where `deletedAt` is not null.

### Admin Email Submission Alerts
When a visitor signs up for the newsletter or sends a message through the contact form, an email alert is triggered to notify the administrator.
- Backed by **Nodemailer**.
- If SMTP credentials in `backend/.env` are left empty, the system automatically prints a simulated HTML/Text alert into the backend CLI logs, ensuring the application functions and records submissions without crashing.
---

## Changelog

### Phase 1 Bug Fixes — Tailwind Invalid Utility Classes (2026-07-14)
Replaced all invalid/non-existent Tailwind CSS neutral color shades across 15 frontend source files.

| Invalid Class | Replaced With | Rationale |
|---|---|---|
| 
eutral-205 | 
eutral-200 | Closest lower valid shade |
| 
eutral-250 | 
eutral-300 | Closest upper valid shade |
| 
eutral-405 | 
eutral-400 | Closest lower valid shade |
| 
eutral-450 | 
eutral-400 | Closest lower valid shade |
| 
eutral-505 | 
eutral-500 | Closest lower valid shade |
| 
eutral-550 | 
eutral-500 | Closest lower valid shade |
| 
eutral-650 | 
eutral-600 | Closest lower valid shade |
| 
eutral-805 | 
eutral-800 | Closest lower valid shade |
| 
eutral-905 | 
eutral-900 | Closest lower valid shade |
| 
eutral-955 | 
eutral-950 | Closest lower valid shade |

**Files changed:** BlogFAQ.jsx, Dashboard.jsx, HeroAbout.jsx, Inquiries.jsx, MediaLibrary.jsx, Portfolio.jsx (admin), SettingsSEO.jsx, TestimonialsTeamPartners.jsx, AboutUs.jsx, Blog.jsx, ClientLayout.jsx, Comments.jsx, Contact.jsx, Portfolio.jsx (client), Services.jsx (client)

**Build result:** ? ite build — 2406 modules transformed, built in 6.03s, zero errors.
---

## Reusable Media Picker Component (`MediaPicker`)

A modern, reusable, drag-and-drop media upload component integrated in the **Portfolio** management module.

### Architecture & Folder Structure
Located under `frontend/src/components/ui/media/`:
- `MediaPicker.jsx` â€” Core orchestrator, manages upload states, validates files, and coordinates API communication.
- `UploadDropzone.jsx` â€” UI dropzone, captures drop/drag/click, and renders the progress bar.
- `ImagePreview.jsx` â€” Renders single card or multiple thumbnail grid with hovering delete buttons.

### Upload Workflow
1. **User interaction**: Drag-and-drops or clicks to browse.
2. **Client-side Validation**: Checks against constraints:
   - **Supported formats**: JPG, JPEG, PNG, WEBP, GIF (mime types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`)
   - **Max size**: 10 MB
3. **API Request**: Performs `POST /api/gallery` with key `file` (multipart/form-data) via Axios proxy.
4. **Backend Processing**: Saves file to `/uploads` and inserts database entry in `GalleryItem`.
5. **State Update**: Updates parent form state (e.g. `coverImage` or `images`) with the returned URL.
6. **Form submit**: On save, updates `Project` in PostgreSQL.

### Component Usage Examples

#### Single Image Mode (Cover Image)
```jsx
import MediaPicker from '../components/ui/media/MediaPicker';

<MediaPicker
  value={form.coverImage}
  onChange={(url) => setForm({ ...form, coverImage: url })}
/>
```

#### Multiple Image Mode (Gallery Images)
```jsx
import MediaPicker from '../components/ui/media/MediaPicker';

<MediaPicker
  value={form.images}
  onChange={(imagesArray) => setForm({ ...form, images: imagesArray })}
  multiple={true}
/>
```

### Developer Notes
- Handles validation and network errors gracefully without disrupting the parent React form state.
- Supports concurrent sequential uploads for multiple file selections.
- Future extension points: Add local drag-and-drop sorting support to the preview grid, or plug-in cloud CDN uploads directly.
