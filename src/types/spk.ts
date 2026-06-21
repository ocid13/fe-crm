import { Lead } from './lead';

export type SpkSalesStatus = 'DRAFT' | 'SENT';
export type SpkFinanceStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Spk {
  id: string;
  spkNumber: string;
  leadId: string;
  projectName: string;
  contractValue: string;
  startDate: string;
  endDate: string;
  salesStatus: SpkSalesStatus;
  financeStatus: SpkFinanceStatus;
  financeNotes: string | null;
  createdAt: string;
  updatedAt: string;
  lead?: Lead;
}