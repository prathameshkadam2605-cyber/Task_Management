"use client";

import React, { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskPriority, TaskStatus } from "@/types/task";

interface TaskFiltersProps {
  search: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  isBoardView?: boolean;
  onSearchChange: (val: string) => void;
  onStatusChange: (val?: TaskStatus) => void;
  onPriorityChange: (val?: TaskPriority) => void;
  onReset: () => void;
}

export function TaskFilters({
  search,
  status,
  priority,
  isBoardView = false,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onReset,
}: TaskFiltersProps) {
  // Local state for debouncing search input (~300ms)
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== search) {
        onSearchChange(localSearch);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [localSearch, search, onSearchChange]);

  const hasActiveFilters = Boolean(search || status || priority);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {/* Search input with 300ms debounce */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter tasks by title..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-8 text-sm h-9"
          />
          {localSearch && (
            <button
              onClick={() => {
                setLocalSearch("");
                onSearchChange("");
              }}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status Filter (Hidden in Board View) */}
        {!isBoardView && (
          <div className="w-full sm:w-40">
            <Select
              value={status || "ALL"}
              onValueChange={(val) => onStatusChange(val === "ALL" ? undefined : (val as TaskStatus))}
            >
              <SelectTrigger className="h-9 text-xs">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-muted-foreground">Status:</span>
                  <SelectValue placeholder="All Statuses" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="Todo">Todo</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Priority Filter */}
        <div className="w-full sm:w-40">
          <Select
            value={priority || "ALL"}
            onValueChange={(val) => onPriorityChange(val === "ALL" ? undefined : (val as TaskPriority))}
          >
            <SelectTrigger className="h-9 text-xs">
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-muted-foreground">Priority:</span>
                <SelectValue placeholder="All Priorities" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Priorities</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setLocalSearch("");
              onReset();
            }}
            className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Reset
            <X className="ml-1 h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
