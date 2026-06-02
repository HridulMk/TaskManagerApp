# Frontend API Integration Guide

Complete guide for using the `api/` layer to connect with the Django backend.

---

## Quick Start

```ts
import { authService, taskService, ApiError } from "@/api";

// Login
try {
  await authService.login({ username, password });
  const user = await authService.getProfile();
  // Redirect to dashboard
} catch (err) {
  const msg = err instanceof ApiError ? err.toDisplayMessage() : "Login failed";
  toast.error(msg);
}

// Fetch tasks with filters
const tasks = await taskService.getAll({
  status: "todo",
  priority: "high",
  search: "urgent",
});

// Get stats from backend (computed server-side)
const stats = await taskService.getStats();
console.log(stats.total, stats.todo, stats.completed);
```

---

## Architecture

```
api/
├── client.ts              # Axios instance — JWT auto-attach, auto-refresh on 401
├── utils.ts               # ApiError class, handleApiError()
├── index.ts               # Barrel export — single import for all
│
├── endpoints/             # Layer 1: Raw HTTP calls only
│   ├── auth.ts            # authEndpoints.login / register / getProfile / changePassword
│   └── tasks.ts           # taskEndpoints.getAll / getStats / getById / create / update / delete
│
└── services/              # Layer 2: Business logic on top of endpoints
    ├── authService.ts     # Manages cookies, error wrapping
    └── taskService.ts     # Error wrapping
```

**Design:**
- `endpoints/` — pure HTTP, no side effects (cookies, toasts), swappable
- `services/` — owns side effects (cookie write/delete), throws `ApiError`
- `client.ts` — auto-attaches JWT, auto-refreshes on 401, redirects to `/login` on refresh failure
- `ApiError` — structured errors with `status`, `fieldErrors`, `toDisplayMessage()`

---

## Auth Service

### `authService.login(data)`

```ts
import { authService } from "@/api";

const tokens = await authService.login({
  username: "john",
  password: "secure123",
});
// Tokens are automatically stored in cookies
```

**Side effects:**
- Sets `access` cookie (expires 1 day)
- Sets `refresh` cookie (expires 7 days)

**Throws:** `ApiError` with field errors if credentials invalid

---

### `authService.register(data)`

```ts
const user = await authService.register({
  username: "jane",
  email: "jane@example.com",
  password: "newsecure456",
});
// Redirect to /login
```

**Throws:** `ApiError` with field-level validation errors (e.g., `username already taken`)

---

### `authService.getProfile()`

```ts
const user = await authService.getProfile();
console.log(user.id, user.username, user.email);
```

**Throws:** `ApiError` if token expired/invalid (triggers auto-refresh via interceptor)

---

### `authService.changePassword(data)`

```ts
await authService.changePassword({
  old_password: "current",
  new_password: "newpassword",
});
toast.success("Password updated");
```

**Throws:** `ApiError` if old password is wrong or new password is invalid

---

### `authService.logout()`

```ts
authService.logout();
// Removes cookies
router.push("/login");
```

**Side effects:**
- Removes `access` and `refresh` cookies

---

### `authService.isAuthenticated()`

```ts
if (!authService.isAuthenticated()) {
  router.push("/login");
}
```

**Returns:** `boolean` — checks if `access` cookie exists

---

## Task Service

### `taskService.getAll(filters?)`

```ts
import { taskService, TaskFilters } from "@/api";

// No filters
const allTasks = await taskService.getAll();

// With filters
const filters: TaskFilters = {
  status: "in_progress",
  priority: "high",
  search: "urgent",
  ordering: "-created_at",  // descending by creation date
};
const tasks = await taskService.getAll(filters);
```

**Filters:**
- `status?`: `"todo" | "in_progress" | "completed"`
- `priority?`: `"low" | "medium" | "high"`
- `search?`: search in title and description
- `ordering?`: `"created_at" | "-created_at" | "due_date" | "priority"` etc.

**Returns:** `Task[]`

---

### `taskService.getStats()`

```ts
const stats = await taskService.getStats();
console.log(stats);
// {
//   total: 12,
//   todo: 4,
//   in_progress: 3,
//   completed: 5,
//   high: 2,
//   medium: 7,
//   low: 3
// }
```

**Use case:** Display dashboard stats computed server-side (avoids client-side counting)

**Returns:** `TaskStats`

---

### `taskService.create(data)`

```ts
const newTask = await taskService.create({
  title: "Fix bug in login",
  description: "User reported issue with 2FA",
  status: "todo",
  priority: "high",
  due_date: "2024-12-25",  // or null
});
```

**Returns:** `Task` (with `id`, `created_at`, `updated_at`)

---

### `taskService.update(id, data)`

```ts
const updatedTask = await taskService.update(taskId, {
  status: "completed",
  priority: "low",
});
```

**Partial update** — only send changed fields

**Returns:** `Task`

---

### `taskService.delete(id)`

```ts
await taskService.delete(taskId);
setTasks(prev => prev.filter(t => t.id !== taskId));
```

**Returns:** `void`

---

## Error Handling

### `ApiError` Class

```ts
class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string[]>;
  toDisplayMessage(): string;
}
```

**Example:**

```ts
try {
  await authService.login({ username, password });
} catch (err) {
  if (err instanceof ApiError) {
    console.log(err.status);         // 400
    console.log(err.fieldErrors);    // { username: ["Invalid credentials"] }
    console.log(err.toDisplayMessage());  // "Invalid credentials"
    toast.error(err.toDisplayMessage());
  }
}
```

**Field errors from Django:**

```json
{
  "username": ["This field is required."],
  "password": ["Ensure this field has at least 8 characters."]
}
```

**Flattened by `toDisplayMessage()`:**
```
"This field is required. Ensure this field has at least 8 characters."
```

---

## Auto Token Refresh

The `client.ts` interceptor automatically handles token refresh:

```
User makes request → 401 → Intercept → POST /auth/refresh/ → Update access cookie → Retry original request
```

**If refresh fails:**
- Removes both cookies
- Redirects to `/login`

**You don't need to handle this manually** — every service call auto-refreshes.

---

## TypeScript Types

All types exported from `@/api` for convenience:

```ts
import {
  User,
  Task,
  TaskStats,
  TaskStatus,       // "todo" | "in_progress" | "completed"
  TaskPriority,     // "low" | "medium" | "high"
  TaskFilters,
  TaskFormData,
  AuthTokens,
  LoginFormData,
  RegisterFormData,
  ChangePasswordData,
} from "@/api";
```

---

## Environment Variables

Set in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Production example:
```env
NEXT_PUBLIC_API_URL=https://api.taskmanager.com/api
```

---

## Usage in Pages

### Login Page

```ts
import { authService, ApiError } from "@/api";
import { toast } from "sonner";

async function handleSubmit(e: FormEvent) {
  e.preventDefault();
  try {
    await authService.login(form);
    const user = await authService.getProfile();
    setUser(user);
    toast.success(`Welcome, ${user.username}!`);
    router.push("/dashboard");
  } catch (err) {
    const msg = err instanceof ApiError ? err.toDisplayMessage() : "Login failed";
    toast.error(msg);
  }
}
```

---

### Dashboard Page

```ts
import { taskService, ApiError, TaskFilters } from "@/api";

const [tasks, setTasks] = useState<Task[]>([]);
const [stats, setStats] = useState<TaskStats>({ total: 0, ... });

useEffect(() => {
  taskService.getStats().then(setStats);
}, []);

useEffect(() => {
  const filters: TaskFilters = {
    status: statusFilter !== "all" ? statusFilter : undefined,
    priority: priorityFilter !== "all" ? priorityFilter : undefined,
    search: search || undefined,
  };
  taskService.getAll(filters).then(setTasks);
}, [statusFilter, priorityFilter, search]);
```

---

### Task Form

```ts
async function handleSubmit(e: FormEvent) {
  e.preventDefault();
  try {
    const saved = task
      ? await taskService.update(task.id, form)
      : await taskService.create(form);
    toast.success(task ? "Updated" : "Created");
    onSaved(saved);
  } catch (err) {
    const msg = err instanceof ApiError ? err.toDisplayMessage() : "Failed";
    toast.error(msg);
  }
}
```

---

## Advanced: Direct Endpoint Usage

If you need raw HTTP without service layer error wrapping:

```ts
import { authEndpoints, taskEndpoints } from "@/api";

// Direct axios response
const res = await taskEndpoints.getAll({ status: "todo" });
console.log(res.status, res.headers, res.data);
```

**Use cases:** Custom error handling, accessing response headers, streaming, etc.

---

## Testing

Mock the services in tests:

```ts
import { taskService } from "@/api";

vi.mock("@/api", () => ({
  taskService: {
    getAll: vi.fn().mockResolvedValue([mockTask]),
    getStats: vi.fn().mockResolvedValue(mockStats),
  },
}));
```

---

## Best Practices

1. **Always import from `@/api`** — not deep paths like `@/api/services/taskService`
2. **Always check `err instanceof ApiError`** before calling `toDisplayMessage()`
3. **Use `taskService.getStats()`** instead of client-side counting for dashboard metrics
4. **Send `null` for empty dates**, not `""`
5. **Logout on critical errors** — if auto-refresh fails, user is redirected automatically
6. **Optimistic UI** — update local state immediately, rollback on error
7. **Debounce search** — avoid hitting backend on every keystroke

---

## Summary Table

| Action | Service Method | HTTP Method | Endpoint |
|---|---|---|---|
| Login | `authService.login(data)` | POST | `/auth/login/` |
| Register | `authService.register(data)` | POST | `/auth/register/` |
| Get Profile | `authService.getProfile()` | GET | `/auth/profile/` |
| Change Password | `authService.changePassword(data)` | POST | `/auth/change-password/` |
| Logout | `authService.logout()` | — | Client-side only |
| Get All Tasks | `taskService.getAll(filters?)` | GET | `/tasks/` |
| Get Task Stats | `taskService.getStats()` | GET | `/tasks/stats/` |
| Create Task | `taskService.create(data)` | POST | `/tasks/` |
| Update Task | `taskService.update(id, data)` | PATCH | `/tasks/{id}/` |
| Delete Task | `taskService.delete(id)` | DELETE | `/tasks/{id}/` |
