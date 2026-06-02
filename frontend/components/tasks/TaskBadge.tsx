import { Badge } from "@/components/ui/badge";
import { TaskStatus } from "@/types";

const statusConfig: Record<TaskStatus, { label: string; variant: "default" | "secondary" | "outline" }> = {
  todo: { label: "Todo", variant: "outline" },
  in_progress: { label: "In Progress", variant: "secondary" },
  completed: { label: "Completed", variant: "default" },
};

export function TaskBadge({ status }: { status: TaskStatus }) {
  const { label, variant } = statusConfig[status];
  return <Badge variant={variant}>{label}</Badge>;
}
