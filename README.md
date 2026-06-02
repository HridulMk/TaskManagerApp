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
Setup Instructions
Prerequisites

Before running the project, ensure the following are installed:

Frontend
Node.js 18 or higher
npm

Verify installation:

node -v
npm -v
Backend
Python 3.10 or higher
pip
Virtual Environment (venv)

Verify installation:

python --version
pip --version
Backend Setup (Django REST API)
1. Clone the Repository
git clone <repository-url>
cd TaskManager
2. Navigate to Backend Directory
cd backend
3. Create Virtual Environment
Windows
python -m venv venv
Linux / macOS
python3 -m venv venv
4. Activate Virtual Environment
Windows
venv\Scripts\activate
Linux / macOS
source venv/bin/activate

After activation you should see:

(venv)

at the beginning of the terminal line.

5. Install Dependencies
pip install -r requirements.txt
6. Apply Database Migrations
python manage.py makemigrations
python manage.py migrate
7. Create Admin User (Optional)
python manage.py createsuperuser

Follow the prompts to create an admin account.

8. Start Backend Server
python manage.py runserver

Backend will be available at:

http://localhost:8000

API Base URL:

http://localhost:8000/api/
Frontend Setup (Next.js)
1. Open a New Terminal

Keep the backend server running and open another terminal.

2. Navigate to Frontend Directory
cd frontend
3. Install Dependencies
npm install

This installs:

Next.js
React
TypeScript
Tailwind CSS
shadcn/ui
Axios
Sonner
Lucide React
js-cookie
4. Configure Environment Variables

Create a file named:

.env.local

inside the frontend root directory.

Add:

NEXT_PUBLIC_API_URL=http://localhost:8000/api
5. Start Development Server
npm run dev

Frontend will be available at:

http://localhost:3000
6. Verify Application

Open:

http://localhost:3000

You should be redirected to:

/login

if not authenticated, or

/dashboard

if a valid JWT access token exists.

Running Both Services

The project requires both servers to be running simultaneously.

Terminal 1 (Backend)
cd backend
venv\Scripts\activate
python manage.py runserver
Terminal 2 (Frontend)
cd frontend
npm run dev
Build for Production
Frontend
npm run build
npm run start
Backend

For production deployment:

python manage.py collectstatic

and deploy using a production server such as Gunicorn, Nginx, or Docker.


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

Folder Structure Explanation
app/

The main application directory using the Next.js App Router. It contains all pages, layouts, and route groups.

(auth)/ – Contains authentication-related pages such as Login and Register.
dashboard/ – Protected area of the application where users manage tasks and view analytics.
layout.tsx – Root layout that wraps the entire application with providers such as AuthProvider and notification components.
page.tsx – Server-side entry page that redirects authenticated users to the dashboard and unauthenticated users to the login page.
globals.css – Global styles, Tailwind CSS imports, and theme variables.
components/

Contains reusable UI components used throughout the application.

components/tasks/

Task-specific components:

TaskCard.tsx – Displays individual tasks with edit and delete actions.
TaskForm.tsx – Form dialog used for creating and updating tasks.
TaskBadge.tsx – Displays task status with color-coded badges.
components/ui/

Auto-generated shadcn/ui components used as the application's design system.

Examples:

Button
Card
Input
Dialog
Dropdown Menu
Badge
Avatar
Shared Components
Navbar.tsx – Application navigation bar with user profile controls.
StatsCard.tsx – Dashboard metric card displaying task statistics.
hooks/

Contains custom React hooks.

useAuth.tsx – Implements authentication context, user state management, login/logout functionality, and session handling.
lib/

Contains utility and API-related logic.

lib/api/

Handles communication with the backend API.

axios.ts – Configured Axios instance with JWT authentication and token refresh logic.
auth.ts – Authentication API functions such as login, register, profile retrieval, and logout.
tasks.ts – Task-related API operations including CRUD functionality.
utils.ts

Contains shared utility functions such as the cn() helper used for merging Tailwind CSS classes.

types/

Stores all TypeScript interfaces, types, and shared data models used throughout the application.

Examples:

User
Task
Authentication Tokens
Form Data Types
public/

Contains static assets that are served directly by Next.js.

Examples:

Images
Icons
Screenshots used in the README
Configuration Files
.env.local – Stores environment variables such as the backend API URL.
components.json – shadcn/ui configuration file.
next.config.ts – Next.js configuration.
eslint.config.mjs – ESLint rules and configuration.
postcss.config.mjs – PostCSS configuration for Tailwind CSS.
tsconfig.json – TypeScript compiler configuration.
package.json – Project metadata, dependencies, and scripts.
Architecture Overview

The application follows a component-based architecture with clear separation of concerns:

Pages (app/) handle routing and layout.
Components (components/) manage UI rendering.
Hooks (hooks/) manage application state and business logic.
API Layer (lib/api/) handles backend communication.
Types (types/) provide type safety across the project.

This structure improves maintainability, scalability, and code reusability while keeping UI, business logic, and API interactions separated.

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

Design Decisions
1. Modern Dashboard-First Interface

Instead of using a traditional table-based task manager, I designed the application as a dashboard that provides an immediate overview of project progress.

The top section displays key metrics:

Total Tasks
Todo Tasks
In Progress Tasks
Completed Tasks

This allows users to understand project status at a glance without navigating through multiple pages.

2. Visual Project Streams Layout

The dashboard uses a custom "Project Streams" layout where statistic cards are arranged in a staggered pattern rather than a standard grid.

Reasons:

Creates visual hierarchy
Draws attention to important project metrics
Makes the interface look more modern and engaging
Differentiates the application from basic CRUD dashboards
3. Priority-Based Productivity

A dedicated Today's Focus section was added to highlight urgent work.

It displays:

High-priority tasks
Incomplete tasks
Tasks due within the next 3 days

This helps users quickly identify work requiring immediate attention.

4. Progress Visualization

The Project Streams card provides a quick summary of project completion.

Instead of showing raw numbers only, progress bars visually represent:

Completed work
Active work
Remaining work

This improves readability and decision-making.

5. Weekly Timeline Overview

A lightweight weekly timeline component was included to provide temporal context for task planning.

Benefits:

Improves schedule awareness
Creates a more dashboard-oriented experience
Serves as a foundation for future timeline enhancements
6. Card-Based Task Management

Tasks are displayed as individual cards rather than table rows.

Advantages:

Better mobile responsiveness
Easier scanning of task information
Clear separation between tasks
More visually appealing interface

Each card displays:

Title
Description
Status
Priority
Due Date
Quick actions
7. Minimal Action Visibility

Edit and Delete buttons remain hidden until a user hovers over a task card.

Reasons:

Reduces visual clutter
Keeps focus on task content
Provides actions only when needed
8. Modal-Based Create and Edit Flow

Task creation and editing are handled using modal dialogs.

Benefits:

Users remain on the dashboard
No page navigation required
Faster workflow
Better user experience

The same form component is reused for both creating and updating tasks.

9. Advanced Filtering and Search

To improve usability for larger task lists, the dashboard includes:

Search by title or description
Status filtering
Priority filtering
Sorting options
Due date filtering

These controls allow users to quickly locate relevant tasks.

10. Dark Mode by Default

The application adopts a dark-themed design with neon blue accents.

Reasons:

Reduced eye strain
Modern appearance
Better visual contrast
Consistent dashboard aesthetic

The cyan accent color is used consistently across:

Buttons
Progress indicators
Focus states
Statistic cards
11. Responsive Design

The interface is fully responsive.

Layout adapts across devices:

Mobile → Single-column layout
Tablet → Two-column layout
Desktop → Multi-column dashboard layout

This ensures usability on different screen sizes.

12. Component-Based Architecture

The frontend follows a reusable component architecture.

Examples:

TaskCard
TaskForm
TaskBadge
StatsCard
Navbar

Benefits:

Easier maintenance
Better scalability
Reduced code duplication
Improved testing support
13. Authentication Experience

Authentication uses JWT tokens stored in cookies.

Benefits:

Secure API access
Automatic session persistence
Server-side authentication checks
Seamless login experience

The root page uses a Next.js Server Component to redirect users directly to the appropriate page based on authentication status.
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
