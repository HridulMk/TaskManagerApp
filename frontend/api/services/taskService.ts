import { taskEndpoints } from "@/api/endpoints/tasks";
import { Task, TaskFormData, TaskFilters, TaskStats, TaskStatus, PaginatedResponse } from "@/types";
import { handleApiError } from "@/api/utils";

export const taskService = {
  async getAll(filters?: TaskFilters): Promise<PaginatedResponse<Task>> {
    try {
      const res = await taskEndpoints.getAll(filters);
      return res.data;
    } catch (err) {
      throw handleApiError(err, "Failed to load tasks");
    }
  },

  async getStats(): Promise<TaskStats> {
    try {
      const res = await taskEndpoints.getStats();
      return res.data;
    } catch (err) {
      throw handleApiError(err, "Failed to load stats");
    }
  },

  async getById(id: number): Promise<Task> {
    try {
      const res = await taskEndpoints.getById(id);
      return res.data;
    } catch (err) {
      throw handleApiError(err, "Failed to load task");
    }
  },

  async create(data: TaskFormData): Promise<Task> {
    try {
      const res = await taskEndpoints.create(data);
      return res.data;
    } catch (err) {
      throw handleApiError(err, "Failed to create task");
    }
  },

  async update(id: number, data: Partial<TaskFormData>): Promise<Task> {
    try {
      const res = await taskEndpoints.update(id, data);
      return res.data;
    } catch (err) {
      throw handleApiError(err, "Failed to update task");
    }
  },

  async bulkUpdateStatus(ids: number[], status: TaskStatus): Promise<Task[]> {
    try {
      const results = await taskEndpoints.bulkUpdateStatus(ids, status);
      return results.map((r) => r.data);
    } catch (err) {
      throw handleApiError(err, "Failed to update tasks");
    }
  },

  async bulkDelete(ids: number[]): Promise<void> {
    try {
      await taskEndpoints.bulkDelete(ids);
    } catch (err) {
      throw handleApiError(err, "Failed to delete tasks");
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await taskEndpoints.delete(id);
    } catch (err) {
      throw handleApiError(err, "Failed to delete task");
    }
  },
};
