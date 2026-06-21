export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST';

export interface Lead {
  id: string;
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  source: string;
  estimatedValue: string;
  status: LeadStatus;
  salesId: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  sales?: { id: string; name: string; email: string };
  spk?: { id: string; spkNumber: string } | null;
}

export interface PaginatedLeads {
  data: Lead[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface StatusHistoryEntry {
  id: string;
  entityType: 'LEAD' | 'SPK';
  entityId: string;
  previousStatus: string | null;
  newStatus: string;
  changedById: string;
  notes: string | null;
  createdAt: string;
  changedBy?: { id: string; name: string; email: string; role: string };
}