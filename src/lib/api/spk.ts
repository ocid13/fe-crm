import { apiClient } from '@/lib/apiClient';
import { Spk, SpkFinanceStatus } from '@/types/spk';
import { StatusHistoryEntry } from '@/types/lead';

export async function getSpkList() {
  const res = await apiClient.get<Spk[]>('/spk');
  return res.data;
}

export async function getSpkById(id: string) {
  const res = await apiClient.get<Spk>(`/spk/${id}`);
  return res.data;
}

export interface UpdateSpkPayload {
  projectName?: string;
  contractValue?: number;
  startDate?: string;
  endDate?: string;
}

export async function updateSpk(id: string, payload: UpdateSpkPayload) {
  const res = await apiClient.patch<Spk>(`/spk/${id}`, payload);
  return res.data;
}

export async function sendSpkToFinance(id: string) {
  const res = await apiClient.patch<Spk>(`/spk/${id}/send`);
  return res.data;
}

export async function reviewSpk(
  id: string,
  financeStatus: SpkFinanceStatus,
  financeNotes?: string,
) {
  const res = await apiClient.patch<Spk>(`/spk/${id}/review`, {
    financeStatus,
    financeNotes,
  });
  return res.data;
}

export async function getSpkHistory(id: string) {
  const res = await apiClient.get<StatusHistoryEntry[]>(`/spk/${id}/history`);
  return res.data;
}