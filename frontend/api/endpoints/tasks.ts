import client from "@/api/client";
import { Task, TaskFormData, TaskStats, TaskFilters, TaskStatus, PaginatedResponse } from "@/types";

const TASKS = "/tasks";

export const taskEndpoints = {
  getAll: (filters?: TaskFilters) =>
    client.get<PaginatedResponse<Task>>(`${TASKS}/`, { params: filters }),

  getStats: () =>
    client.get<TaskStats>(`${TASKS}/stats/`),

  getById: (id: number) =>
    client.get<Task>(`${TASKS}/${id}/`),

  create: (data: TaskFormData) =>
    client.post<Task>(`${TASKS}/`, data),

  update: (id: number, data: Partial<TaskFormData>) =>
    client.patch<Task>(`${TASKS}/${id}/`, data),

  bulkUpdateStatus: (ids: number[], status: TaskStatus) =>
    Promise.all(ids.map((id) => client.patch<Task>(`${TASKS}/${id}/`, { status }))),

  bulkDelete: (ids: number[]) =>
    Promise.all(ids.map((id) => client.delete(`${TASKS}/${id}/`))),

  delete: (id: number) =>
    client.delete(`${TASKS}/${id}/`),
};
