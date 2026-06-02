"use client";

import { TaskStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckSquare, Square, ChevronDown, Trash2, Clock, Loader2, CheckCircle2 } from "lucide-react";

interface BulkActionBarProps {
  totalCount: number;
  selectedCount: number;
  allSelected: boolean;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onMarkAs: (status: TaskStatus) => void;
  onDeleteSelected: () => void;
  loading: boolean;
}

const statusOptions: { label: string; value: TaskStatus; icon: React.ElementType }[] = [
  { label: "Todo",        value: "todo",        icon: Clock        },
  { label: "In Progress", value: "in_progress", icon: Loader2      },
  { label: "Completed",   value: "completed",   icon: CheckCircle2 },
];

export function BulkActionBar({
  totalCount,
  selectedCount,
  allSelected,
  onSelectAll,
  onDeselectAll,
  onMarkAs,
  onDeleteSelected,
  loading,
}: BulkActionBarProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg border bg-background shadow-sm flex-wrap">

      {/* Select / Deselect All */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 h-8"
        onClick={allSelected ? onDeselectAll : onSelectAll}
      >
        {allSelected ? (
          <CheckSquare className="h-4 w-4 text-primary" />
        ) : (
          <Square className="h-4 w-4" />
        )}
        {allSelected ? "Deselect All" : "Select All"}
      </Button>

      {selectedCount > 0 && (
        <>
          <Separator orientation="vertical" className="h-5" />

          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{selectedCount}</span>
            {" "}of {totalCount} selected
          </span>

          <Separator orientation="vertical" className="h-5" />

          {/* Mark As dropdown — use native trigger styling, no asChild (base-ui incompatible) */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 h-8 text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none cursor-pointer transition-colors"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              Mark as
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuGroup>
                {statusOptions.map(({ label, value, icon: Icon }) => (
                  <DropdownMenuItem
                    key={value}
                    onClick={() => onMarkAs(value)}
                    className="gap-2 cursor-pointer"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Delete selected */}
          <Button
            variant="destructive"
            size="sm"
            className="h-8 gap-1.5"
            onClick={onDeleteSelected}
            disabled={loading}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete ({selectedCount})
          </Button>
        </>
      )}
    </div>
  );
}
