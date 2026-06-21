import { apiClient } from '@/lib/apiClient';
import { Lead, PaginatedLeads, LeadStatus, StatusHistoryEntry } from '@/types/lead';

export interface CreateLeadPayload {
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  source: string;
  estimatedValue: number;
  notes?: string;
}

export interface QueryLeadParams {
  search?: string;
  status?: LeadStatus;
  page?: number;
  limit?: number;
}

export async function getLeads(params: QueryLeadParams) {
  const res = await apiClient.get<PaginatedLeads>('/leads', { params });
  return res.data;
}

export async function getLeadById(id: string) {
  const res = await apiClient.get<Lead>(`/leads/${id}`);
  return res.data;
}

export async function createLead(payload: CreateLeadPayload) {
  const res = await apiClient.post<Lead>('/leads', payload);
  return res.data;
}

export async function updateLead(id: string, payload: Partial<CreateLeadPayload>) {
  const res = await apiClient.patch<Lead>(`/leads/${id}`, payload);
  return res.data;
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus,
  notes?: string,
) {
  const res = await apiClient.patch<Lead>(`/leads/${id}/status`, {
    status,
    notes,
  });
  return res.data;
}

export async function deleteLead(id: string) {
  await apiClient.delete(`/leads/${id}`);
}

export async function getLeadHistory(id: string) {
  const res = await apiClient.get<StatusHistoryEntry[]>(`/leads/${id}/history`);
  return res.data;
}

export interface ConvertToSpkPayload {
  projectName: string;
  contractValue: number;
  startDate: string;
  endDate: string;
}

export async function convertLeadToSpk(
  leadId: string,
  payload: ConvertToSpkPayload,
) {
  const res = await apiClient.post(`/leads/${leadId}/convert-to-spk`, payload);
  return res.data;
}