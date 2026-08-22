"use client";

import React, { useState } from "react";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  pointerWithin,
  rectIntersection,
  CollisionDetection,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { KanbanColumn } from "@/components/tasks/KanbanColumn";
import { KanbanCard } from "@/components/tasks/KanbanCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Task, TaskStatus } from "@/types/task";
import { taskService } from "@/services/taskService";

interface TaskBoardProps {
  tasks: Task[];
  isLoading: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onQuickAdd: (status: TaskStatus) => void;
}

const COLUMNS: TaskStatus[] = ["Todo", "In Progress", "Completed"];

export function TaskBoard({
  tasks,
  isLoading,
  onEdit,
  onDelete,
  onQuickAdd,
}: TaskBoardProps) {
  const queryClient = useQueryClient();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [pendingTaskIds, setPendingTaskIds] = useState<Set<string>>(new Set());

  // Sensors with keyboard accessibility + click tolerance
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px drag required before initiating drag, allowing clicks on cards/buttons
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Custom collision detection strategy for multi-container Kanban board
  const customCollisionDetection: CollisionDetection = (args) => {
    // 1. Check if pointer is directly over a droppable target (column or card)
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }

    // 2. Try bounding rect intersection (essential for keyboard drag movement)
    const rectCollisions = rectIntersection(args);
    if (rectCollisions.length > 0) {
      return rectCollisions;
    }

    // 3. Fall back to closestCorners
    return closestCorners(args);
  };

  // Status Mutation with Optimistic Updates & Safe Rollback
  const statusMutation = useMutation({
    mutationFn: ({
      taskId,
      newStatus,
    }: {
      taskId: string;
      newStatus: TaskStatus;
      previousStatus: TaskStatus;
    }) => taskService.updateTask(taskId, { status: newStatus }),

    onMutate: async ({ taskId, newStatus }) => {
      // Add to pending set for visual feedback
      setPendingTaskIds((prev) => new Set(prev).add(taskId));

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      await queryClient.cancelQueries({ queryKey: ["board-tasks"] });

      // Snapshot all matching board queries and table queries
      const previousBoardQueries = queryClient.getQueriesData<{ items: Task[]; total: number }>({
        queryKey: ["board-tasks"],
      });
      const previousTasksQueries = queryClient.getQueriesData<{ items: Task[]; total: number }>({
        queryKey: ["tasks"],
      });

      // Optimistically update all board-tasks caches
      queryClient.setQueriesData<{ items: Task[]; total: number }>(
        { queryKey: ["board-tasks"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((t) =>
              t.id === taskId
                ? { ...t, status: newStatus, updated_at: new Date().toISOString() }
                : t
            ),
          };
        }
      );

      // Optimistically update all tasks table caches
      queryClient.setQueriesData<{ items: Task[]; total: number }>(
        { queryKey: ["tasks"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((t) =>
              t.id === taskId
                ? { ...t, status: newStatus, updated_at: new Date().toISOString() }
                : t
            ),
          };
        }
      );

      return { previousBoardQueries, previousTasksQueries, taskId };
    },

    onError: (err, { taskId, previousStatus, newStatus }, context) => {
      // Rollback to snapshots
      if (context?.previousBoardQueries) {
        context.previousBoardQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousTasksQueries) {
        context.previousTasksQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(
        (err as Error)?.message ||
          `Failed to move task to "${newStatus}". Reverted back to "${previousStatus}".`
      );
    },

    onSuccess: (updatedTask) => {
      toast.success(`Task moved to "${updatedTask.status}"`);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks-summary"] });
      queryClient.invalidateQueries({ queryKey: ["board-tasks"] });
    },

    onSettled: (_data, _error, { taskId }) => {
      // Remove from pending set
      setPendingTaskIds((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    },
  });

  const handleDragStart = (event: DragStartEvent) => {
    const task = event.active.data.current?.task as Task;
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const previousStatus = active.data.current?.currentStatus as TaskStatus;

    // Resolve target status whether dropped on a Column container or on a Task Card
    let targetStatus: TaskStatus | undefined;

    if (COLUMNS.includes(over.id as TaskStatus)) {
      // Dropped directly on a column droppable
      targetStatus = over.id as TaskStatus;
    } else if (over.data.current?.currentStatus) {
      // Dropped on a card that has currentStatus
      targetStatus = over.data.current.currentStatus as TaskStatus;
    } else if (over.data.current?.task?.status) {
      targetStatus = over.data.current.task.status as TaskStatus;
    } else {
      // Fallback lookup in tasks list by over.id
      const targetCard = tasks.find((t) => t.id === over.id);
      if (targetCard) {
        targetStatus = targetCard.status;
      }
    }

    if (!targetStatus || targetStatus === previousStatus) {
      return; // No-op if dropped in same column or unknown target
    }

    // Trigger optimistic mutation
    statusMutation.mutate({
      taskId,
      newStatus: targetStatus,
      previousStatus,
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        {COLUMNS.map((col) => (
          <div key={col} className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-8 rounded-full" />
            </div>
            <Skeleton className="h-28 w-full rounded-lg" />
            <Skeleton className="h-28 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  // Group tasks by status
  const todoTasks = tasks.filter((t) => t.status === "Todo");
  const inProgressTasks = tasks.filter((t) => t.status === "In Progress");
  const completedTasks = tasks.filter((t) => t.status === "Completed");

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 w-full items-start">
        <KanbanColumn
          status="Todo"
          tasks={todoTasks}
          onEdit={onEdit}
          onDelete={onDelete}
          onQuickAdd={onQuickAdd}
          pendingTaskIds={pendingTaskIds}
        />
        <KanbanColumn
          status="In Progress"
          tasks={inProgressTasks}
          onEdit={onEdit}
          onDelete={onDelete}
          onQuickAdd={onQuickAdd}
          pendingTaskIds={pendingTaskIds}
        />
        <KanbanColumn
          status="Completed"
          tasks={completedTasks}
          onEdit={onEdit}
          onDelete={onDelete}
          onQuickAdd={onQuickAdd}
          pendingTaskIds={pendingTaskIds}
        />
      </div>

      {/* Drag Overlay for smooth preview while dragging */}
      <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
        {activeTask ? (
          <KanbanCard
            task={activeTask}
            onEdit={() => {}}
            onDelete={() => {}}
            isOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
