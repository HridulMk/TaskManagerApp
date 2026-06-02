"use client";

import { Task, TaskPriority } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TaskBadge } from "./TaskBadge";
import { Pencil, Trash2, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  selected: boolean;
  onToggleSelect: (id: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

const priorityConfig: Record<TaskPriority, { label: string; className: string }> = {
  high:   { label: "High",   className: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800" },
  medium: { label: "Medium", className: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800" },
  low:    { label: "Low",    className: "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800" },
};

export function TaskCard({ task, selected, onToggleSelect, onEdit, onDelete }: TaskCardProps) {
  const priority = priorityConfig[task.priority];

  return (
    <Card className={cn(
      "group hover:shadow-md transition-all",
      selected && "ring-2 ring-primary"
    )}>
      <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect(task.id)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary cursor-pointer"
          />
          <CardTitle className="text-base leading-snug line-clamp-2 flex-1">{task.title}</CardTitle>
        </div>
        <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onEdit(task)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
        )}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <TaskBadge status={task.status} />
            <Badge variant="outline" className={`text-xs ${priority.className}`}>
              {priority.label}
            </Badge>
          </div>
          {task.due_date && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="h-3 w-3" />
              {new Date(task.due_date).toLocaleDateString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
