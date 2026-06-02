import api from "./axios";
import { Task, TaskFormData, TaskStatus } from "@/types";

export async function getTasks(status?: TaskStatus, search?: string): Promise<Task[]> {
  const params: Record<string, string> = {};
  if (status) params.status = status;
  if (search) params.search = search;
  const res = await api.get<Task[]>("/tasks/", { params });
  return res.data;
}

export async function createTask(data: TaskFormData): Promise<Task> {
  const res = await api.post<Task>("/tasks/", data);
  return res.data;
}

export async function updateTask(id: number, data: Partial<TaskFormData>): Promise<Task> {
  const res = await api.patch<Task>(`/tasks/${id}/`, data);
  return res.data;
}

export async function deleteTask(id: number): Promise<void> {
  await api.delete(`/tasks/${id}/`);
}
