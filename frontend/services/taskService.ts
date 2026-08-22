import {
  Task,
  TaskCreateInput,
  TaskUpdateInput,
  TaskListParams,
  TaskListResponse,
  TaskSummaryResponse,
  TaskPriority,
  TaskStatus,
} from "@/types/task";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return {} as T;
  }

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorDetail = data?.detail || response.statusText || "An unexpected error occurred";
    throw new ApiError(errorDetail, response.status);
  }

  return data as T;
}

export const taskService = {
  /**
   * Fetch paginated and filtered tasks.
   */
  async getTasks(params?: TaskListParams): Promise<TaskListResponse> {
    const url = new URL(`${API_BASE}/tasks`);

    if (params) {
      if (params.status && params.status !== ("ALL" as unknown as TaskStatus)) {
        url.searchParams.append("status", params.status);
      }
      if (params.priority && params.priority !== ("ALL" as unknown as TaskPriority)) {
        url.searchParams.append("priority", params.priority);
      }
      if (params.search && params.search.trim()) url.searchParams.append("search", params.search.trim());
      if (params.sort_by) url.searchParams.append("sort_by", params.sort_by);
      if (params.sort_order) url.searchParams.append("sort_order", params.sort_order);
      if (params.page !== undefined) url.searchParams.append("page", params.page.toString());
      if (params.page_size !== undefined) url.searchParams.append("page_size", params.page_size.toString());
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    return handleResponse<TaskListResponse>(response);
  },

  /**
   * Retrieve a single task by ID.
   */
  async getTaskById(id: string): Promise<Task> {
    const response = await fetch(`${API_BASE}/tasks/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return handleResponse<Task>(response);
  },

  /**
   * Retrieve task summary statistics.
   */
  async getTaskSummary(): Promise<TaskSummaryResponse> {
    const response = await fetch(`${API_BASE}/tasks/summary`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return handleResponse<TaskSummaryResponse>(response);
  },

  /**
   * Create a new task.
   */
  async createTask(data: TaskCreateInput): Promise<Task> {
    const response = await fetch(`${API_BASE}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<Task>(response);
  },

  /**
   * Update an existing task.
   */
  async updateTask(id: string, data: TaskUpdateInput): Promise<Task> {
    const response = await fetch(`${API_BASE}/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<Task>(response);
  },

  /**
   * Delete a task.
   */
  async deleteTask(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/tasks/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    return handleResponse<void>(response);
  },
};
