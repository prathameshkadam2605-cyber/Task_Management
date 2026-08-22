"use client";

import React, { useState, useEffect } from "react";
import { Plus, RefreshCw, AlertCircle, Table as TableIcon, LayoutGrid } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { TaskTable } from "@/components/tasks/TaskTable";
import { TaskBoard } from "@/components/tasks/TaskBoard";
import { TaskPagination } from "@/components/tasks/TaskPagination";
import { TaskFormModal } from "@/components/tasks/TaskFormModal";
import { DeleteConfirmDialog } from "@/components/tasks/DeleteConfirmDialog";
import { taskService } from "@/services/taskService";
import { Task, TaskPriority, TaskSortBy, TaskStatus, SortOrder } from "@/types/task";

type ViewMode = "table" | "board";

export default function TasksPage() {
  // View mode state persisted in localStorage
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [isViewMounted, setIsViewMounted] = useState<boolean>(false);

  // Filter & Pagination State
  const [search, setSearch] = useState<string>("");
  const [status, setStatus] = useState<TaskStatus | undefined>(undefined);
  const [priority, setPriority] = useState<TaskPriority | undefined>(undefined);
  const [sortBy, setSortBy] = useState<TaskSortBy>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [defaultStatusForCreate, setDefaultStatusForCreate] = useState<TaskStatus>("Todo");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Read view mode from localStorage on mount
  useEffect(() => {
    const savedView = localStorage.getItem("taskflow_tasks_view") as ViewMode;
    if (savedView === "table" || savedView === "board") {
      setViewMode(savedView);
    }
    setIsViewMounted(true);
  }, []);

  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem("taskflow_tasks_view", mode);
  };

  // Fetch Tasks for Table View (with pagination & status filter)
  const {
    data: tableData,
    isLoading: isTableLoading,
    isError: isTableError,
    error: tableError,
    refetch: refetchTable,
    isFetching: isTableFetching,
  } = useQuery({
    queryKey: [
      "tasks",
      { search, status, priority, sortBy, sortOrder, page, pageSize },
    ],
    queryFn: () =>
      taskService.getTasks({
        search,
        status,
        priority,
        sort_by: sortBy,
        sort_order: sortOrder,
        page,
        page_size: pageSize,
      }),
    enabled: viewMode === "table",
  });

  // Fetch Tasks for Board View (unpaginated up to 100 items, status grouped on board)
  const {
    data: boardData,
    isLoading: isBoardLoading,
    isError: isBoardError,
    error: boardError,
    refetch: refetchBoard,
    isFetching: isBoardFetching,
  } = useQuery({
    queryKey: [
      "board-tasks",
      { search, priority, sortBy, sortOrder },
    ],
    queryFn: () =>
      taskService.getTasks({
        search,
        priority,
        sort_by: sortBy,
        sort_order: sortOrder,
        page: 1,
        page_size: 100,
      }),
    enabled: viewMode === "board",
  });

  // Guard against out-of-bounds page state when total items decrease (e.g. deletion or filter narrowing)
  useEffect(() => {
    if (tableData && tableData.total > 0) {
      const maxPages = Math.ceil(tableData.total / pageSize);
      if (page > maxPages) {
        setPage(maxPages);
      }
    }
  }, [tableData, page, pageSize]);

  const handleSort = (field: TaskSortBy) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatus(undefined);
    setPriority(undefined);
    setPage(1);
  };

  const handleOpenCreateModal = () => {
    setTaskToEdit(null);
    setDefaultStatusForCreate("Todo");
    setIsFormModalOpen(true);
  };

  const handleQuickAdd = (columnStatus: TaskStatus) => {
    setTaskToEdit(null);
    setDefaultStatusForCreate(columnStatus);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setTaskToEdit(task);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (task: Task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  const handleRefresh = () => {
    if (viewMode === "table") {
      refetchTable();
    } else {
      refetchBoard();
    }
  };

  const isFetching = isTableFetching || isBoardFetching;
  const isError = viewMode === "table" ? isTableError : isBoardError;
  const currentError = viewMode === "table" ? tableError : boardError;

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Tasks
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here&apos;s a list of your tasks for this month!
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle Segmented Control */}
          <div className="flex items-center rounded-lg border bg-muted/50 p-0.5">
            <button
              onClick={() => handleViewChange("table")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
                viewMode === "table"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Table View"
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => handleViewChange("board")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
                viewMode === "board"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Board</span>
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isFetching}
            className="h-9 gap-1.5 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            onClick={handleOpenCreateModal}
            className="h-9 gap-1.5 text-xs font-semibold shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Create Task</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <TaskFilters
        search={search}
        status={status}
        priority={priority}
        isBoardView={viewMode === "board"}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        onStatusChange={(val) => {
          setStatus(val);
          setPage(1);
        }}
        onPriorityChange={(val) => {
          setPriority(val);
          setPage(1);
        }}
        onReset={handleResetFilters}
      />

      {/* Error Banner */}
      {isError && (
        <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>
              {(currentError as Error)?.message || "Failed to load tasks from server. Please check backend connection."}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="h-8 text-xs">
            Try Again
          </Button>
        </div>
      )}

      {/* Main View: Table or Board */}
      {viewMode === "table" ? (
        <>
          <TaskTable
            tasks={tableData?.items || []}
            isLoading={isTableLoading}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            onEdit={handleOpenEditModal}
            onDelete={handleOpenDeleteModal}
          />

          {/* Pagination Footer (Table View Only) */}
          {!isTableLoading && tableData && tableData.total > 0 && (
            <TaskPagination
              page={page}
              pageSize={pageSize}
              total={tableData.total}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          )}
        </>
      ) : (
        <TaskBoard
          tasks={boardData?.items || []}
          isLoading={isBoardLoading}
          onEdit={handleOpenEditModal}
          onDelete={handleOpenDeleteModal}
          onQuickAdd={handleQuickAdd}
        />
      )}

      {/* Create / Edit Task Modal */}
      <TaskFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        taskToEdit={taskToEdit}
        defaultStatus={defaultStatusForCreate}
      />

      {/* Delete Confirmation Alert Dialog */}
      <DeleteConfirmDialog
        task={taskToDelete}
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
      />
    </div>
  );
}
