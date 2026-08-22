"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Pencil,
  Trash2,
  CheckCircle2,
  Circle,
  AlertCircle,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  Copy,
  Check,
  FileQuestion,
  Layers,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskFormModal } from "@/components/tasks/TaskFormModal";
import { DeleteConfirmDialog } from "@/components/tasks/DeleteConfirmDialog";
import { taskService } from "@/services/taskService";
import { formatDisplayDate } from "@/lib/utils";
import { TaskPriority, TaskStatus } from "@/types/task";

export default function TaskDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch Task Details
  const {
    data: task,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => taskService.getTaskById(taskId),
    retry: 1,
    enabled: Boolean(taskId),
  });

  const handleCopyId = () => {
    if (!task) return;
    navigator.clipboard.writeText(task.id);
    setCopied(true);
    toast.success("Task ID copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper for Priority Badge
  const renderPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case "High":
        return (
          <Badge variant="high" className="gap-1.5 font-medium text-xs py-1 px-2.5">
            <ArrowUp className="h-3.5 w-3.5 text-red-600" />
            High Priority
          </Badge>
        );
      case "Medium":
        return (
          <Badge variant="medium" className="gap-1.5 font-medium text-xs py-1 px-2.5">
            <ArrowRight className="h-3.5 w-3.5 text-amber-600" />
            Medium Priority
          </Badge>
        );
      case "Low":
        return (
          <Badge variant="low" className="gap-1.5 font-medium text-xs py-1 px-2.5">
            <ArrowDown className="h-3.5 w-3.5 text-slate-500" />
            Low Priority
          </Badge>
        );
    }
  };

  // Helper for Status Badge
  const renderStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case "Todo":
        return (
          <Badge variant="todo" className="gap-1.5 font-medium text-xs py-1 px-2.5">
            <Circle className="h-3 w-3 text-slate-400 fill-slate-400" />
            Todo
          </Badge>
        );
      case "In Progress":
        return (
          <Badge variant="inprogress" className="gap-1.5 font-medium text-xs py-1 px-2.5">
            <Clock className="h-3.5 w-3.5 text-blue-600" />
            In Progress
          </Badge>
        );
      case "Completed":
        return (
          <Badge variant="completed" className="gap-1.5 font-medium text-xs py-1 px-2.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            Completed
          </Badge>
        );
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full">
        <Skeleton className="h-6 w-32" />
        <div className="rounded-xl border bg-card p-6 space-y-6">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-3/4" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 404 / Error State
  if (isError || !task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/80 text-muted-foreground">
          <FileQuestion className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-xl font-bold tracking-tight text-foreground">
          Task Not Found
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          {(error as Error)?.message ||
            `We couldn't find a task with ID "${taskId}". It may have been deleted or the link is invalid.`}
        </p>
        <div className="mt-6 flex items-center gap-3">
          <Link href="/tasks">
            <Button className="gap-2 text-xs font-semibold">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Task List</span>
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const shortCode = `TASK-${task.id.slice(0, 4).toUpperCase()}`;

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/tasks"
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Tasks</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            className="h-8 gap-1.5 text-xs font-medium"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span>Edit</span>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            className="h-8 gap-1.5 text-xs font-medium"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* Main Task Detail Card */}
      <Card className="shadow-xs border-border/80 overflow-hidden">
        <CardHeader className="pb-4 border-b bg-muted/20">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                {shortCode}
              </span>
              <button
                onClick={handleCopyId}
                className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors"
                title="Copy Full UUID"
              >
                <span>{task.id}</span>
                {copied ? (
                  <Check className="h-3 w-3 text-emerald-600" />
                ) : (
                  <Copy className="h-3 w-3 opacity-60" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-2">
              {renderStatusBadge(task.status)}
              {renderPriorityBadge(task.priority)}
            </div>
          </div>

          <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground pt-3">
            {task.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Description Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Description
            </h3>
            {task.description ? (
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap rounded-lg bg-muted/20 p-4 border border-border/50">
                {task.description}
              </p>
            ) : (
              <p className="text-sm italic text-muted-foreground">
                No description provided for this task.
              </p>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
            {/* Due Date */}
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Due Date
              </span>
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{task.due_date ? formatDisplayDate(task.due_date) : "No due date"}</span>
              </div>
            </div>

            {/* Created At */}
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Created At
              </span>
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{formatDisplayDate(task.created_at)}</span>
              </div>
            </div>

            {/* Updated At */}
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Last Updated
              </span>
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{formatDisplayDate(task.updated_at)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <TaskFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        taskToEdit={task}
      />

      {/* Delete Confirmation Alert Dialog */}
      <DeleteConfirmDialog
        task={task}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={() => router.push("/tasks")}
      />
    </div>
  );
}
