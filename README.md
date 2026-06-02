# TaskManager — Frontend

A modern task management dashboard built with **Next.js 16**, **TypeScript**, **Tailwind CSS v4**, and **shadcn/ui**. Connects to a Django REST Framework backend with JWT authentication.

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.2.7 | React framework (App Router) |
| TypeScript | ^5 | Static typing |
| Tailwind CSS | ^4 | Utility-first styling |
| shadcn/ui | ^4.10.0 | Component library (base-ui) |
| Axios | ^1.16.1 | HTTP client with interceptors |
| Sonner | ^2.0.7 | Toast notifications |
| Lucide React | ^1.17.0 | Icon set |
| js-cookie | ^3.0.8 | JWT cookie management |

---

## Folder Architecture

```
frontend/
│
├── app/                            # Next.js App Router
│   ├── (auth)/                     # Route group — unauthenticated pages
│   │   ├── layout.tsx              # Centered full-screen layout for auth pages
│   │   ├── login/
│   │   │   └── page.tsx            # Login page (username + password)
│   │   └── register/
│   │       └── page.tsx            # Register page (username, email, password)
│   │
│   ├── dashboard/
│   │   └── page.tsx                # Protected dashboard — task list, stats, filters
│   │
│   ├── globals.css                 # Global styles + Tailwind + shadcn CSS variables
│   ├── layout.tsx                  # Root layout — AuthProvider + Toaster
│   └── page.tsx                    # Root redirect → /dashboard or /login
│
├── components/
│   ├── tasks/                      # Task-specific reusable components
│   │   ├── TaskBadge.tsx           # Status badge (Todo / In Progress / Completed)
│   │   ├── TaskCard.tsx            # Task card with inline edit/delete actions
│   │   └── TaskForm.tsx            # Create / Edit task dialog (shadcn Dialog)
│   │
│   ├── ui/                         # Auto-generated shadcn/ui components
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   └── sonner.tsx
│   │
│   ├── Navbar.tsx                  # Sticky top navbar with user avatar dropdown
│   └── StatsCard.tsx               # Summary metric card for dashboard
│
├── hooks/
│   └── useAuth.tsx                 # AuthContext — user state, login, logout
│
├── lib/
│   ├── api/
│   │   ├── axios.ts                # Axios instance — base URL + JWT interceptors (auto-refresh)
│   │   ├── auth.ts                 # API calls: login, register, getProfile, logout
│   │   └── tasks.ts                # API calls: getTasks, createTask, updateTask, deleteTask
│   └── utils.ts                    # cn() utility (clsx + tailwind-merge)
│
├── types/
│   └── index.ts                    # All TypeScript interfaces and types
│
├── public/                         # Static assets
│
├── .env.local                      # Environment variables (NEXT_PUBLIC_API_URL)
├── .gitignore
├── components.json                 # shadcn/ui configuration
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── requirements.txt                # Node.js dependency reference
├── tailwind.config (inline)        # Tailwind v4 uses CSS-based config
└── tsconfig.json
```

---

## Pages

### `/login`
- Username + password form
- On success: stores JWT tokens in cookies, redirects to `/dashboard`
- Link to register page

### `/register`
- Username, email, password form
- On success: redirects to `/login`
- Displays field-level validation errors from the API

### `/dashboard`
- Protected — redirects to `/login` if unauthenticated
- Summary stats row: Total / Todo / In Progress / Completed counts
- Search input (title + description)
- Status filter dropdown (All / Todo / In Progress / Completed)
- Responsive task grid (1 → 2 → 3 columns)
- Create task button → opens dialog
- Hover on task card reveals Edit / Delete icon buttons
- Optimistic UI — no full refetch after mutations

---

## Components

### `TaskCard`
Displays a single task with title, description preview, status badge, due date, and hover-reveal action buttons.

### `TaskForm`
shadcn Dialog containing a form for creating or editing a task. Fields: title, description, status (Select), due date. Resets state based on whether a task is passed in.

### `TaskBadge`
Maps `TaskStatus` → shadcn `Badge` variant:
- `todo` → outline
- `in_progress` → secondary
- `completed` → default

### `Navbar`
Sticky header with app logo and user avatar dropdown (shows username, email, and sign out).

### `StatsCard`
A shadcn `Card` displaying a label, count, icon, and description — used for the 4-metric summary row.

---

## Types

Defined in `types/index.ts`:

```ts
type TaskStatus = "todo" | "in_progress" | "completed"

interface User { id, username, email }
interface Task { id, title, description, status, due_date, created_at, updated_at }
interface AuthTokens { access, refresh }
interface TaskFormData { title, description, status, due_date }
interface LoginFormData { username, password }
interface RegisterFormData { username, email, password }
```

---

## API Integration

Base URL is set via `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Axios Interceptors (`lib/api/axios.ts`)
- **Request:** Attaches `Authorization: Bearer <access_token>` from cookies
- **Response (401):** Automatically calls `/auth/refresh/`, updates the access token cookie, and retries the original request. Redirects to `/login` if refresh fails.

### Endpoints Used

| Function | Method | Endpoint |
|---|---|---|
| `login` | POST | `/auth/login/` |
| `register` | POST | `/auth/register/` |
| `getProfile` | GET | `/auth/profile/` |
| `getTasks` | GET | `/tasks/?status=&search=` |
| `createTask` | POST | `/tasks/` |
| `updateTask` | PATCH | `/tasks/:id/` |
| `deleteTask` | DELETE | `/tasks/:id/` |

---

## Getting Started

### Prerequisites
- Node.js >= 18
- Django backend running on `http://localhost:8000`

### Installation

```bash
cd frontend
npm install
```

### Environment Setup

Create `.env.local` in the `frontend/` root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm run start
```

### Lint

```bash
npm run lint
```

---

## Authentication Flow

```
User visits /
    └── Has access cookie?
        ├── YES → /dashboard
        └── NO  → /login
                    └── Login success
                            └── Store access + refresh in cookies
                                └── /dashboard
```

JWT access token expires in **1 day**, refresh token in **7 days** (configured in Django backend).

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api` | Django backend API base URL |
