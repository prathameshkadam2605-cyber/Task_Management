"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Calendar,
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  GripVertical,
  Loader2,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Task, TaskPriority } from "@/types/task";
import { formatDisplayDate } from "@/lib/utils";

interface KanbanCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  isPending?: boolean;
  isOverlay?: boolean;
}

export function KanbanCard({
  task,
  onEdit,
  onDelete,
  isPending = false,
  isOverlay = false,
}: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { task, currentStatus: task.status, type: "Task" },
    disabled: isOverlay,
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : isPending ? 0.65 : 1,
  };

  const renderPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case "High":
        return (
          <Badge variant="high" className="gap-1 font-medium text-[10px] px-2 py-0.5">
            <ArrowUp className="h-2.5 w-2.5 text-red-600" />
            High
          </Badge>
        );
      case "Medium":
        return (
          <Badge variant="medium" className="gap-1 font-medium text-[10px] px-2 py-0.5">
            <ArrowRight className="h-2.5 w-2.5 text-amber-600" />
            Medium
          </Badge>
        );
      case "Low":
        return (
          <Badge variant="low" className="gap-1 font-medium text-[10px] px-2 py-0.5">
            <ArrowDown className="h-2.5 w-2.5 text-slate-500" />
            Low
          </Badge>
        );
    }
  };

  const shortCode = `TASK-${task.id.slice(0, 4).toUpperCase()}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      tabIndex={isOverlay ? -1 : 0}
      className={`group relative select-none touch-none outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg ${
        isOverlay ? "cursor-grabbing rotate-2 shadow-2xl scale-105" : "cursor-grab active:cursor-grabbing"
      }`}
    >
      <Card
        onClick={(e) => {
          // If clicked (not dragged), open edit modal
          if (!isDragging) {
            onEdit(task);
          }
        }}
        className={`border transition-all duration-200 hover:border-primary/40 hover:shadow-md bg-card ${
          isPending ? "border-primary/30 animate-pulse" : ""
        } ${isOverlay ? "border-primary shadow-xl bg-card" : ""}`}
      >
        <CardContent className="p-3.5 space-y-2.5">
          {/* Card Top: Code, Priority, and Action Dropdown */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
              <span className="font-mono text-[11px] font-semibold text-muted-foreground">
                {shortCode}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {isPending && (
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  Saving
                </span>
              )}
              {renderPriorityBadge(task.priority)}

              {!isOverlay && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(task);
                      }}
                      className="gap-2 text-xs cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Edit Task</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(task);
                      }}
                      className="gap-2 text-xs text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete Task</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Card Title */}
          <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
            {task.title}
          </h4>

          {/* Description Snippet */}
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Card Footer: Due Date */}
          <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{task.due_date ? formatDisplayDate(task.due_date) : "No due date"}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
