"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Layers,
  Circle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  RefreshCw,
  Calendar,
  Inbox,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TaskFormModal } from "@/components/tasks/TaskFormModal";
import { taskService } from "@/services/taskService";
import { formatDisplayDate } from "@/lib/utils";
import { TaskPriority, TaskStatus } from "@/types/task";

export default function DashboardPage() {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch Task Summary Stats
  const {
    data: summary,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
    isFetching: isSummaryFetching,
  } = useQuery({
    queryKey: ["tasks-summary"],
    queryFn: () => taskService.getTaskSummary(),
  });

  // Fetch 5 Most Recent Tasks
  const {
    data: recentTasksData,
    isLoading: isRecentLoading,
    refetch: refetchRecent,
    isFetching: isRecentFetching,
  } = useQuery({
    queryKey: ["recent-tasks"],
    queryFn: () =>
      taskService.getTasks({
        sort_by: "created_at",
        sort_order: "desc",
        page_size: 5,
        page: 1,
      }),
  });

  const isRefreshing = isSummaryFetching || isRecentFetching;

  const handleRefreshAll = () => {
    refetchSummary();
    refetchRecent();
  };

  // Helper for Priority Badge
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

  // Helper for Status Badge
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

  return (
    <div className="flex flex-col gap-8 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header Section */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of your project progress, task statuses, and recent activity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            className="h-9 gap-1.5 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="h-9 gap-1.5 text-xs font-semibold shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Create Task</span>
          </Button>
        </div>
      </div>

      {/* 5 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Tasks */}
        <Card className="hover:shadow-md transition-shadow border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Tasks
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Layers className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isSummaryLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-foreground">
                {summary?.total ?? 0}
              </div>
            )}
            <p className="text-[11px] text-muted-foreground mt-1">
              All tasks in system
            </p>
          </CardContent>
        </Card>

        {/* Todo Tasks */}
        <Card className="hover:shadow-md transition-shadow border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Todo
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Circle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isSummaryLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                {summary?.todo ?? 0}
              </div>
            )}
            <p className="text-[11px] text-muted-foreground mt-1">
              Pending action
            </p>
          </CardContent>
        </Card>

        {/* In Progress Tasks */}
        <Card className="hover:shadow-md transition-shadow border-blue-100 dark:border-blue-900/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              In Progress
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isSummaryLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {summary?.in_progress ?? 0}
              </div>
            )}
            <p className="text-[11px] text-muted-foreground mt-1">
              Currently working on
            </p>
          </CardContent>
        </Card>

        {/* Completed Tasks */}
        <Card className="hover:shadow-md transition-shadow border-emerald-100 dark:border-emerald-900/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Completed
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isSummaryLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {summary?.completed ?? 0}
              </div>
            )}
            <p className="text-[11px] text-muted-foreground mt-1">
              Tasks resolved
            </p>
          </CardContent>
        </Card>

        {/* High Priority Tasks */}
        <Card className="hover:shadow-md transition-shadow border-red-100 dark:border-red-900/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              High Priority
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isSummaryLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {summary?.high_priority ?? 0}
              </div>
            )}
            <p className="text-[11px] text-muted-foreground mt-1">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tasks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Recent Tasks
            </h2>
            <p className="text-xs text-muted-foreground">
              The latest 5 tasks added to your board
            </p>
          </div>

          <Link href="/tasks">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
              <span>View all tasks</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* Recent Tasks Content */}
        {isRecentLoading ? (
          <div className="rounded-xl border bg-card p-4 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : recentTasksData?.items && recentTasksData.items.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block rounded-xl border bg-card shadow-xs overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[100px] pl-4">Task ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="w-[130px]">Status</TableHead>
                    <TableHead className="w-[110px]">Priority</TableHead>
                    <TableHead className="w-[130px]">Due Date</TableHead>
                    <TableHead className="w-[130px] pr-4">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTasksData.items.map((task) => {
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
                            <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                              {task.title}
                            </span>
                            {task.description && (
                              <span className="text-xs text-muted-foreground line-clamp-1">
                                {task.description}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{renderStatusBadge(task.status)}</TableCell>
                        <TableCell>{renderPriorityBadge(task.priority)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDisplayDate(task.due_date)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground pr-4">
                          {formatDisplayDate(task.created_at)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Stacked View */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {recentTasksData.items.map((task) => {
                const shortId = `TASK-${task.id.slice(0, 4).toUpperCase()}`;
                return (
                  <div
                    key={task.id}
                    onClick={() => router.push(`/tasks/${task.id}`)}
                    className="rounded-lg border bg-card p-4 shadow-xs space-y-2 cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-semibold text-muted-foreground">
                        {shortId}
                      </span>
                      {renderPriorityBadge(task.priority)}
                    </div>
                    <h4 className="font-semibold text-sm text-foreground leading-snug">
                      {task.title}
                    </h4>
                    <div className="flex items-center justify-between border-t pt-2 text-xs text-muted-foreground">
                      <div>{renderStatusBadge(task.status)}</div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDisplayDate(task.due_date)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card/50 py-12 px-4 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Inbox className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-foreground">No tasks yet</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
              Get started by creating your first task to see progress metrics and activity here.
            </p>
            <Button
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 h-8 gap-1.5 text-xs font-medium"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Task</span>
            </Button>
          </div>
        )}
      </div>

      {/* Quick Task Creation Modal */}
      <TaskFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
