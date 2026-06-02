"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskForm } from "@/components/tasks/TaskForm";
import { BulkActionBar } from "@/components/tasks/BulkActionBar";
import { StatsCard } from "@/components/StatsCard";
import { Pagination } from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { taskService, ApiError } from "@/api";
import { useAuth } from "@/hooks/useAuth";
import { Task, TaskStatus, TaskPriority, TaskStats, PaginatedResponse } from "@/types";
import {
  Plus,
  Search,
  ListTodo,
  Loader,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  Target,
  TrendingUp,
  CalendarDays,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const PAGE_SIZE = 6;

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tasks, setTasks]               = useState<Task[]>([]);
  const [pagination, setPagination]     = useState<Omit<PaginatedResponse<Task>, "results">>({ count: 0, next: null, previous: null });
  const [stats, setStats]               = useState<TaskStats>({ total: 0, todo: 0, in_progress: 0, completed: 0, high: 0, medium: 0, low: 0 });
  const [loading, setLoading]           = useState(true);
  const [bulkLoading, setBulkLoading]   = useState(false);
  const [page, setPage]                 = useState(1);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter]     = useState<TaskStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");
  const [dueDateFilter, setDueDateFilter]   = useState<string>("");
  const [ordering, setOrdering]             = useState<string>("default");
  const [formOpen, setFormOpen]         = useState(false);
  const [editTask, setEditTask]         = useState<Task | null>(null);
  const [selectedIds, setSelectedIds]   = useState<Set<number>>(new Set());

  const totalPages = Math.ceil(pagination.count / PAGE_SIZE);

  // ── fetch helpers ────────────────────────────────────────────────────────────

  const fetchStats = useCallback(async () => {
    try { setStats(await taskService.getStats()); } catch { /* non-critical */ }
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await taskService.getAll({
        status:   statusFilter   !== "all" ? statusFilter   : undefined,
        priority: priorityFilter !== "all" ? priorityFilter : undefined,
        search:   search || undefined,
        ordering: ordering !== "default"   ? ordering       : undefined,
        due_date: dueDateFilter || undefined,
        page,
      });
      setTasks(data.results);
      setPagination({ count: data.count, next: data.next, previous: data.previous });
      setSelectedIds((prev) => {
        const visibleIds = new Set(data.results.map((t) => t.id));
        return new Set([...prev].filter((id) => visibleIds.has(id)));
      });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.toDisplayMessage() : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, dueDateFilter, search, ordering, page]);

  // Reset to page 1 whenever filters/search/ordering change
  useEffect(() => { setPage(1); }, [statusFilter, priorityFilter, dueDateFilter, search, ordering]);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) { fetchStats(); fetchTasks(); }
  }, [user, fetchStats, fetchTasks]);

  // ── single-task actions ───────────────────────────────────────────────────────

  async function handleDelete(id: number) {
    try {
      await taskService.delete(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setSelectedIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
      setPagination((prev) => ({ ...prev, count: prev.count - 1 }));
      fetchStats();
      toast.success("Task deleted");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.toDisplayMessage() : "Failed to delete task");
    }
  }

  function handleEdit(task: Task) { setEditTask(task); setFormOpen(true); }

  function handleSaved(saved: Task) {
    setTasks((prev) => {
      const exists = prev.find((t) => t.id === saved.id);
      return exists ? prev.map((t) => (t.id === saved.id ? saved : t)) : [saved, ...prev];
    });
    fetchStats();
    fetchTasks();
  }

  // ── selection ────────────────────────────────────────────────────────────────

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }

  function selectAll()   { setSelectedIds(new Set(tasks.map((t) => t.id))); }
  function deselectAll() { setSelectedIds(new Set()); }

  const allSelected = tasks.length > 0 && selectedIds.size === tasks.length;

  // ── bulk actions ──────────────────────────────────────────────────────────────

  async function handleBulkMarkAs(status: TaskStatus) {
    const ids = [...selectedIds];
    setBulkLoading(true);
    try {
      const updated = await taskService.bulkUpdateStatus(ids, status);
      const updatedMap = new Map(updated.map((t) => [t.id, t]));
      setTasks((prev) => prev.map((t) => updatedMap.get(t.id) ?? t));
      fetchStats();
      toast.success(`${ids.length} task${ids.length > 1 ? "s" : ""} marked as ${status.replace("_", " ")}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.toDisplayMessage() : "Bulk update failed");
    } finally {
      setBulkLoading(false);
    }
  }

  async function handleBulkDelete() {
    const ids = [...selectedIds];
    setBulkLoading(true);
    try {
      await taskService.bulkDelete(ids);
      setTasks((prev) => prev.filter((t) => !selectedIds.has(t.id)));
      setSelectedIds(new Set());
      setPagination((prev) => ({ ...prev, count: prev.count - ids.length }));
      fetchStats();
      fetchTasks();
      toast.success(`${ids.length} task${ids.length > 1 ? "s" : ""} deleted`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.toDisplayMessage() : "Bulk delete failed");
    } finally {
      setBulkLoading(false);
    }
  }






  const highPriorityTasks = tasks.filter(
  (task) =>
    task.priority === "high" &&
    task.status !== "completed"
);

const completedPercentage =
  stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;



  // ── render ────────────────────────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin h-6 w-6 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen grid-bg">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold neon-text">
  Project Streams Dashboard
</h1>
            <p className="text-muted-foreground text-sm">Welcome back, {user?.username}</p>
          </div>
          <Button onClick={() => { setEditTask(null); setFormOpen(true); }} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>

        {/* Stats */}
        {/* <div className="glass-card neon-border rounded-xl hover-glow">
  
          <StatsCard title="Total Tasks"  count={stats.total}       icon={ListTodo}     description="All tasks" />
          <StatsCard title="Todo"         count={stats.todo}        icon={Clock}        description="Not started" />
          <StatsCard title="In Progress"  count={stats.in_progress} icon={Loader}       description="Active" />
          <StatsCard title="Completed"    count={stats.completed}   icon={CheckCircle2} description="Done" />
        </div> */}

        {/* Stats */}

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 lg:auto-rows-min">

  {/* Total Tasks */}
  <div className="lg:col-span-3 lg:col-start-1 lg:row-start-1">
    <div className="glass-card neon-border rounded-xl hover-glow h-full float-card float-delay-1">
      <StatsCard
        title="Total Tasks"
        count={stats.total}
        icon={ListTodo}
        description="All tasks"
      />
    </div>
  </div>

  {/* In Progress */}
  <div className="lg:col-span-3 lg:col-start-7 lg:row-start-1">
    <div className="glass-card neon-border rounded-xl hover-glow h-full float-card float-delay-2">
      <StatsCard
        title="In Progress"
        count={stats.in_progress}
        icon={Loader}
        description="Active"
      />
    </div>
  </div>

  {/* Todo */}
  <div className="lg:col-span-3 lg:col-start-4 lg:row-start-2">
    <div className="glass-card neon-border rounded-xl hover-glow h-full float-card float-delay-3">
      <StatsCard
        title="Todo"
        count={stats.todo}
        icon={Clock}
        description="Not started"
      />
    </div>
  </div>

  {/* Completed */}
  <div className="lg:col-span-3 lg:col-start-10  lg:row-start-2">
    <div className="glass-card neon-border rounded-xl hover-glow h-full float-card float-delay-4">
      <StatsCard
        title="Completed"
        count={stats.completed}
        icon={CheckCircle2}
        description="Done"
      />
    </div>
  </div>

</div>









        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

  {/* Today's Focus */}
  <Card className="glass-card neon-border hover-glow">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Target className="h-5 w-5 text-primary" />
        Today's Focus
      </CardTitle>
    </CardHeader>

    <CardContent>
      <div className="space-y-3">
        <div className="text-4xl font-bold">
          {highPriorityTasks.length}
        </div>

        <p className="text-sm text-muted-foreground">
          High-priority tasks requiring attention
        </p>

        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary"
            style={{
              width: `${Math.min(
                (highPriorityTasks.length /
                  Math.max(stats.total, 1)) *
                  100,
                100
              )}%`,
            }}
          />
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Project Streams */}
  <Card className="glass-card neon-border hover-glow">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        Project Streams
      </CardTitle>
    </CardHeader>

    <CardContent className="space-y-5">

      <div>
        <div className="flex justify-between mb-2 text-sm">
          <span>Completed</span>
          <span>{completedPercentage}%</span>
        </div>

        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary"
            style={{
              width: `${completedPercentage}%`,
            }}
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between mb-2 text-sm">
          <span>In Progress</span>
          <span>{stats.in_progress}</span>
        </div>

        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-500"
            style={{
              width: `${Math.min(
                (stats.in_progress /
                  Math.max(stats.total, 1)) *
                  100,
                100
              )}%`,
            }}
          />
        </div>
      </div>

    </CardContent>
  </Card>

  {/* Weekly Timeline */}
  <Card className="glass-card neon-border hover-glow">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-primary" />
        Weekly Timeline
      </CardTitle>
    </CardHeader>

    <CardContent>
      <div className="grid grid-cols-7 gap-1">
        {["M", "T", "W", "T", "F", "S", "S"].map(
          (day, index) => (
            <div
              key={index}
              className="h-16 rounded-lg bg-muted flex items-center justify-center text-sm font-medium"
            >
              {day}
            </div>
          )
        )}
      </div>
    </CardContent>
  </Card>

</div>















        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter((val ?? "all") as TaskStatus | "all")}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="todo">Todo</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={(val) => setPriorityFilter((val ?? "all") as TaskPriority | "all")}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="date"
              className="pl-9 w-full sm:w-44"
              value={dueDateFilter}
              onChange={(e) => setDueDateFilter(e.target.value)}
            />
          </div>
          <Select value={ordering} onValueChange={(val) => setOrdering(val ?? "default")}>
            <SelectTrigger className="w-full sm:w-44">
              <ArrowUpDown className="h-3.5 w-3.5 mr-1 opacity-60" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default (Newest)</SelectItem>
              <SelectItem value="due_date">Due Date ↑ (Earliest)</SelectItem>
              <SelectItem value="-due_date">Due Date ↓ (Latest)</SelectItem>
              <SelectItem value="created_at">Created ↑ (Oldest)</SelectItem>
              <SelectItem value="-created_at">Created ↓ (Newest)</SelectItem>
              <SelectItem value="priority">Priority ↑ (Low→High)</SelectItem>
              <SelectItem value="-priority">Priority ↓ (High→Low)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Action Bar */}
        {!loading && tasks.length > 0 && (
          <BulkActionBar
            totalCount={tasks.length}
            selectedCount={selectedIds.size}
            allSelected={allSelected}
            onSelectAll={selectAll}
            onDeselectAll={deselectAll}
            onMarkAs={handleBulkMarkAs}
            onDeleteSelected={handleBulkDelete}
            loading={bulkLoading}
          />
        )}

        {/* Task Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader className="animate-spin h-6 w-6 text-muted-foreground" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <ListTodo className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No tasks found</p>
            <p className="text-sm">Create a new task to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                selected={selectedIds.has(task.id)}
                onToggleSelect={toggleSelect}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-col items-center gap-1">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => { setPage(p); setSelectedIds(new Set()); }}
            />
            <p className="text-xs text-muted-foreground">
              Page {page} of {totalPages} &middot; {pagination.count} total task{pagination.count !== 1 ? "s" : ""}
            </p>
          </div>
        )}

      </main>

      <TaskForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
        task={editTask}
      />
    </div>
  );
}
