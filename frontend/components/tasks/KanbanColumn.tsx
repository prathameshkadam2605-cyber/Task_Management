"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Circle, Clock, CheckCircle2, Plus, Inbox } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KanbanCard } from "@/components/tasks/KanbanCard";
import { Task, TaskStatus } from "@/types/task";

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onQuickAdd: (status: TaskStatus) => void;
  pendingTaskIds: Set<string>;
}

export function KanbanColumn({
  status,
  tasks,
  onEdit,
  onDelete,
  onQuickAdd,
  pendingTaskIds,
}: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: status,
    data: { status, type: "Column" },
  });

  const getColumnHeaderConfig = () => {
    switch (status) {
      case "Todo":
        return {
          icon: <Circle className="h-3.5 w-3.5 text-slate-400 fill-slate-400" />,
          title: "Todo",
          headerBorder: "border-t-slate-400 dark:border-t-slate-500",
          countBadge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
        };
      case "In Progress":
        return {
          icon: <Clock className="h-3.5 w-3.5 text-blue-500" />,
          title: "In Progress",
          headerBorder: "border-t-blue-500 dark:border-t-blue-400",
          countBadge: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
        };
      case "Completed":
        return {
          icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
          title: "Completed",
          headerBorder: "border-t-emerald-500 dark:border-t-emerald-400",
          countBadge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
        };
    }
  };

  const config = getColumnHeaderConfig();
  const taskIds = tasks.map((t) => t.id);

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col flex-1 min-w-[280px] sm:min-w-[320px] rounded-xl border bg-muted/30 p-3 sm:p-4 transition-all duration-200 ${
        config.headerBorder
      } border-t-2 ${
        isOver
          ? "bg-primary/5 border-primary ring-2 ring-primary/20"
          : "border-border/80"
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          {config.icon}
          <h3 className="text-sm font-bold text-foreground">{config.title}</h3>
          <span
            className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold ${config.countBadge}`}
          >
            {tasks.length}
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onQuickAdd(status)}
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
          title={`Add task to ${status}`}
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add task</span>
        </Button>
      </div>

      {/* Cards Container wrapped in SortableContext */}
      <SortableContext id={status} items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-3 flex-1 min-h-[300px]">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <KanbanCard
                key={task.id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                isPending={pendingTaskIds.has(task.id)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 rounded-lg border border-dashed border-border/70 p-6 text-center text-muted-foreground/60 select-none">
              <Inbox className="h-6 w-6 mb-1 opacity-50" />
              <p className="text-xs font-medium">No tasks in {status}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onQuickAdd(status)}
                className="mt-2 h-7 gap-1 text-[11px] text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-3 w-3" />
                <span>Add task</span>
              </Button>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
