export type TaskPriority = "Low" | "Medium" | "High";

export type TaskStatus = "Todo" | "In Progress" | "Completed";

export type TaskSortBy = "title" | "priority" | "status" | "due_date" | "created_at";

export type SortOrder = "asc" | "desc";

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date?: string | null; // ISO format "YYYY-MM-DD"
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}

export interface TaskCreateInput {
  title: string;
  description?: string | null;
  priority: TaskPriority;
  status?: TaskStatus;
  due_date?: string | null;
}

export interface TaskUpdateInput {
  title?: string;
  description?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  due_date?: string | null;
}

export interface TaskListParams {
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
  sort_by?: TaskSortBy;
  sort_order?: SortOrder;
  page?: number;
  page_size?: number;
}

export interface TaskListResponse {
  items: Task[];
  total: number;
  page: number;
  page_size: number;
}

export interface TaskSummaryResponse {
  total: number;
  todo: number;
  in_progress: number;
  completed: number;
  high_priority: number;
}
