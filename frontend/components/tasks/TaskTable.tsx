"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  Circle,
  Clock,
  CheckCircle2,
  Calendar,
  Pencil,
  Trash2,
  ArrowUpDown,
  Inbox,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Task, TaskPriority, TaskSortBy, TaskStatus, SortOrder } from "@/types/task";
import { formatDisplayDate } from "@/lib/utils";

interface TaskTableProps {
  tasks: Task[];
  isLoading: boolean;
  sortBy: TaskSortBy;
  sortOrder: SortOrder;
  onSort: (field: TaskSortBy) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskTable({
  tasks,
  isLoading,
  sortBy,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
}: TaskTableProps) {
  const router = useRouter();

  // Helper for Priority Badge + Icon
  const renderPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case "High":
        return (
          <Badge variant="high" className="gap-1 font-medium text-[11px]">
            <ArrowUp className="h-3 w-3 text-red-600" />
            High
          </Badge>
        );
      case "Medium":
        return (
          <Badge variant="medium" className="gap-1 font-medium text-[11px]">
            <ArrowRight className="h-3 w-3 text-amber-600" />
            Medium
          </Badge>
        );
      case "Low":
        return (
          <Badge variant="low" className="gap-1 font-medium text-[11px]">
            <ArrowDown className="h-3 w-3 text-slate-500" />
            Low
          </Badge>
        );
    }
  };

  // Helper for Status Badge + Icon
  const renderStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case "Todo":
        return (
          <Badge variant="todo" className="gap-1.5 font-medium text-[11px]">
            <Circle className="h-2.5 w-2.5 text-slate-400 fill-slate-400" />
            Todo
          </Badge>
        );
      case "In Progress":
        return (
          <Badge variant="inprogress" className="gap-1.5 font-medium text-[11px]">
            <Clock className="h-3 w-3 text-blue-600" />
            In Progress
          </Badge>
        );
      case "Completed":
        return (
          <Badge variant="completed" className="gap-1.5 font-medium text-[11px]">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            Completed
          </Badge>
        );
    }
  };

  const renderSortHeader = (label: string, field: TaskSortBy) => {
    const isActive = sortBy === field;
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onSort(field)}
        className="-ml-3 h-8 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        <span>{label}</span>
        {isActive ? (
          sortOrder === "asc" ? (
            <ArrowUp className="ml-1.5 h-3 w-3 text-primary font-bold" />
          ) : (
            <ArrowDown className="ml-1.5 h-3 w-3 text-primary font-bold" />
          )
        ) : (
          <ArrowUpDown className="ml-1.5 h-3 w-3 opacity-40" />
        )}
      </Button>
    );
  };

  // Loading Skeleton View
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="rounded-md border bg-card p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4 py-2">
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-60" />
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-24 hidden md:block" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty State View
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-card/50 py-16 px-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Inbox className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-foreground">No tasks found</h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm">
          No tasks match your current search or filter criteria. Try adjusting your filters or create a new task.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border bg-card shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[110px] pl-4">Task ID</TableHead>
              <TableHead className="min-w-[280px]">
                {renderSortHeader("Title", "title")}
              </TableHead>
              <TableHead className="w-[140px]">
                {renderSortHeader("Status", "status")}
              </TableHead>
              <TableHead className="w-[120px]">
                {renderSortHeader("Priority", "priority")}
              </TableHead>
              <TableHead className="w-[130px]">
                {renderSortHeader("Due Date", "due_date")}
              </TableHead>
              <TableHead className="w-[130px]">
                {renderSortHeader("Created", "created_at")}
              </TableHead>
              <TableHead className="w-[60px] text-right pr-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => {
              const shortId = `TASK-${task.id.slice(0, 4).toUpperCase()}`;
              return (
                <TableRow
                  key={task.id}
                  onClick={() => router.push(`/tasks/${task.id}`)}
                  className="group hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <TableCell className="pl-4 font-mono text-xs font-medium text-muted-foreground">
                    {shortId}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {task.title}
                      </span>
                      {task.description && (
                        <span className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {task.description}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{renderStatusBadge(task.status)}</TableCell>
                  <TableCell>{renderPriorityBadge(task.priority)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDisplayDate(task.due_date)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDisplayDate(task.created_at)}
                  </TableCell>
                  <TableCell className="text-right pr-4" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 p-0 opacity-80 group-hover:opacity-100 hover:bg-secondary"
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(task);
                          }}
                          className="gap-2 text-xs"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit Task
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(task);
                          }}
                          className="gap-2 text-xs text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete Task
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Stacked Cards View */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {tasks.map((task) => {
          const shortId = `TASK-${task.id.slice(0, 4).toUpperCase()}`;
          return (
            <div
              key={task.id}
              onClick={() => router.push(`/tasks/${task.id}`)}
              className="rounded-lg border bg-card p-4 shadow-xs space-y-3 cursor-pointer hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-semibold text-muted-foreground">
                      {shortId}
                    </span>
                    {renderPriorityBadge(task.priority)}
                  </div>
                  <h4 className="font-semibold text-sm text-foreground leading-snug">
                    {task.title}
                  </h4>
                </div>

                <div onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(task);
                        }}
                        className="gap-2 text-xs"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit Task
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(task);
                        }}
                        className="gap-2 text-xs text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete Task
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {task.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {task.description}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between border-t pt-2 text-xs text-muted-foreground gap-2">
                <div>{renderStatusBadge(task.status)}</div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Due {formatDisplayDate(task.due_date)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
