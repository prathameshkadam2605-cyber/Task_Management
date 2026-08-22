"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Task, TaskPriority, TaskStatus } from "@/types/task";
import { taskService } from "@/services/taskService";

const taskFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title cannot exceed 200 characters")
    .refine((val) => val.trim().length > 0, {
      message: "Title cannot be empty or whitespace only",
    }),
  description: z
    .string()
    .max(2000, "Description cannot exceed 2000 characters")
    .optional()
    .or(z.literal("")),
  priority: z.enum(["Low", "Medium", "High"] as const, {
    required_error: "Please select a priority level",
  }),
  status: z.enum(["Todo", "In Progress", "Completed"] as const, {
    required_error: "Please select a status",
  }),
  due_date: z
    .string()
    .optional()
    .or(z.literal("")),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
  defaultStatus?: TaskStatus;
}

export function TaskFormModal({
  isOpen,
  onClose,
  taskToEdit,
  defaultStatus,
}: TaskFormModalProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(taskToEdit);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "Medium",
      status: defaultStatus || "Todo",
      due_date: "",
    },
  });

  const selectedPriority = watch("priority");
  const selectedStatus = watch("status");

  useEffect(() => {
    if (taskToEdit) {
      reset({
        title: taskToEdit.title,
        description: taskToEdit.description || "",
        priority: taskToEdit.priority,
        status: taskToEdit.status,
        due_date: taskToEdit.due_date || "",
      });
    } else {
      reset({
        title: "",
        description: "",
        priority: "Medium",
        status: defaultStatus || "Todo",
        due_date: "",
      });
    }
  }, [taskToEdit, defaultStatus, reset, isOpen]);

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (values: TaskFormValues) => {
      const payload = {
        title: values.title.trim(),
        description: values.description?.trim() ? values.description.trim() : null,
        priority: values.priority,
        status: values.status,
        due_date: values.due_date ? values.due_date : null, // Clean "YYYY-MM-DD" string
      };
      return taskService.createTask(payload);
    },
    onSuccess: () => {
      toast.success("Task created successfully");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks-summary"] });
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create task");
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: (values: TaskFormValues) => {
      if (!taskToEdit) throw new Error("Task not found");
      const payload = {
        title: values.title.trim(),
        description: values.description?.trim() ? values.description.trim() : null,
        priority: values.priority,
        status: values.status,
        due_date: values.due_date ? values.due_date : null,
      };
      return taskService.updateTask(taskToEdit.id, payload);
    },
    onSuccess: () => {
      toast.success("Task updated successfully");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks-summary"] });
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update task");
    },
  });

  const onSubmit = (values: TaskFormValues) => {
    if (isEditing) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending || isSubmitting;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : "Create Task"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details of your existing task below."
              : "Fill out the fields below to create a new task in your workflow."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Title Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="e.g. Implement authentication flow"
              {...register("title")}
              className={errors.title ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Description <span className="text-xs text-muted-foreground font-normal">(optional)</span>
            </label>
            <Textarea
              placeholder="Add optional notes, steps, or acceptance criteria..."
              rows={3}
              {...register("description")}
              className={errors.description ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Priority and Status Selects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Priority <span className="text-destructive">*</span>
              </label>
              <Select
                value={selectedPriority}
                onValueChange={(val) => setValue("priority", val as TaskPriority, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High Priority</SelectItem>
                  <SelectItem value="Medium">Medium Priority</SelectItem>
                  <SelectItem value="Low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-xs text-destructive">{errors.priority.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Status <span className="text-destructive">*</span>
              </label>
              <Select
                value={selectedStatus}
                onValueChange={(val) => setValue("status", val as TaskStatus, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todo">Todo</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-xs text-destructive">{errors.status.message}</p>
              )}
            </div>
          </div>

          {/* Due Date Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Due Date <span className="text-xs text-muted-foreground font-normal">(optional)</span>
            </label>
            <Input
              type="date"
              {...register("due_date")}
              className="w-full text-sm"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
