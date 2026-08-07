# ArchStudio Portfolio CMS — AI Development Rules & Engineering Standards

You are the senior AI engineer responsible for the ArchStudio Portfolio CMS project.

## Technology Stack
- **Frontend**: React 18, Vite, TailwindCSS, Axios, TanStack Query
- **Backend**: Node.js, Express.js
- **Database / ORM**: PostgreSQL, Prisma ORM v7
- **Authentication**: JWT Authentication, bcryptjs
- **Storage & Uploads**: Multer File Uploads (`/uploads`)

---

## 1. General Development Rules
- Read [brain.md](file:///d:/ArchStudioCMS/brain.md) before making any architectural decision.
- Understand the requested feature or bug completely before modifying any code.
- Perform a root cause analysis before implementing a fix.
- Apply the smallest possible change that resolves the issue.
- Never introduce unrelated refactoring.
- Never change project architecture without explicit approval.
- Stop immediately after completing the requested task.

---

## 2. Frontend Rules
- Reuse existing components, hooks, utility functions, CSS variables, and Tailwind utilities.
- Preserve existing component hierarchy, routing structure, loading states, and error handling.
- **Never modify unless explicitly requested**:
  - UI layout, typography, colors, spacing, responsive behavior, animations, Dark Mode, Light Mode.

---

## 3. Backend Rules
- Reuse existing controllers, middleware, services, utilities, validators, and routes.
- Never duplicate business logic.
- Maintain consistent API response formats.
- Preserve error handling, validation, authentication, authorization, and logging.

---

## 4. Database Rules
- **Never without explicit approval**:
  - Modify Prisma schema or models, create/delete migrations, reset database, push schema, execute raw destructive SQL, seed database, or delete production data.
- Always reuse the existing Prisma Client configuration (`@prisma/adapter-pg` / `prisma.config.ts`).
- Prefer guidance over automation for database administration.

---

## 5. Authentication Rules
- **Preserve**:
  - JWT authentication, protected routes, Remember Me functionality, admin login flow (`/admin/login`), session persistence, token expiration handling, and admin keyboard shortcut (`Ctrl+Shift+A` / `Cmd+Shift+A`).
- Never weaken authentication.

---

## 6. CMS Rules
- Maintain consistency across all CMS modules:
  - Hero, About, Achievements, Workflow, Why Choose Us, Services, Portfolio, Media Library, Testimonials, Team, Partners, FAQ, Blog, Contact, Newsletter, SEO, Settings.
- For every change, preserve CRUD behavior, validation, soft deletes (`deletedAt: null`), activity logging (`ActivityLog`), and public website rendering.

---

## 7. File Upload Rules
- Reuse the existing upload middleware ([backend/src/middleware/upload.middleware.js](file:///d:/ArchStudioCMS/backend/src/middleware/upload.middleware.js)).
- Never bypass MIME validation, file extension validation, size limits, or security checks.
- Never expose uploaded files outside the intended upload directory (`backend/uploads`).

---

## 8. Security Rules
- **Never**:
  - Hardcode secrets, passwords, JWT secrets, API keys, or database credentials.
- Always use environment variables loaded from `.env`.
- Maintain CORS whitelist, Helmet, rate limiting, JWT security, password hashing, input validation, Prisma query safety, XSS protection, and SQL injection protection.
- Never reduce existing security.

---

## 9. Environment Rules
- Maintain [.env](file:///d:/ArchStudioCMS/.env), [backend/.env](file:///d:/ArchStudioCMS/backend/.env), [.env.example](file:///d:/ArchStudioCMS/.env.example), and [backend/.env.example](file:///d:/ArchStudioCMS/backend/.env.example).
- Never commit secrets.
- Machine-specific IP addresses must never be hardcoded in source files. Use `ALLOWED_ORIGINS` for LAN, staging, and production configuration.

---

## 10. Performance Rules
- Avoid unnecessary re-renders, duplicate API calls, duplicate database queries, or large bundle increases.
- Reuse lazy loading where applicable.
- Optimize only when necessary.

---

## 11. Documentation Rules
- Before finishing, verify whether [brain.md](file:///d:/ArchStudioCMS/brain.md) or [README.md](file:///d:/ArchStudioCMS/README.md) require updates.
- Update documentation only if the project architecture, workflow, or setup has genuinely changed.
- Never rewrite documentation unnecessarily.

---

## 12. Git Rules
- Before declaring a task complete, verify:
  - No `node_modules`, `dist`, `.env`, `uploads`, temporary files, helper scripts, or generated artifacts are staged or committed.
- Review `git status` and `git diff --cached --stat`.
- Only intended source code should be staged.

---

## 13. Verification & Completion Rules
- After every implementation:
  - Run the project build (`npm run build`).
  - Verify affected functionality and check browser console / network requests.
  - Ensure no regressions were introduced.
- If something cannot be tested, explicitly report it as **Not Tested**.
- Confirm only the requested work was performed and deliver concise, evidence-based verification.
