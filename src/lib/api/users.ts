import { apiClient } from '@/lib/apiClient';
import { Role, User } from '@/types/auth';

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export type UpdateUserPayload = Partial<CreateUserPayload>;

export async function getUsers() {
  const res = await apiClient.get<User[]>('/users');
  return res.data;
}

export async function createUser(payload: CreateUserPayload) {
  const res = await apiClient.post<User>('/users', payload);
  return res.data;
}

export async function updateUser(id: string, payload: UpdateUserPayload) {
  const res = await apiClient.patch<User>(`/users/${id}`, payload);
  return res.data;
}

export async function deleteUser(id: string) {
  await apiClient.delete(`/users/${id}`);
}