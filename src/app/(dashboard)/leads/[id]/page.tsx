'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getLeadById,
  updateLeadStatus,
  getLeadHistory,
  convertLeadToSpk,
} from '@/lib/api/leads';
import { Lead, LeadStatus, StatusHistoryEntry } from '@/types/lead';
import { useAuthStore } from '@/lib/authStore';

const STATUS_FLOW: LeadStatus[] = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'NEGOTIATION',
  'WON',
  'LOST',
];

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;
  const role = useAuthStore((state) => state.user?.role);

  const [lead, setLead] = useState<Lead | null>(null);
  const [history, setHistory] = useState<StatusHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConvertModal, setShowConvertModal] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [leadData, historyData] = await Promise.all([
        getLeadById(leadId),
        getLeadHistory(leadId),
      ]);
      setLead(leadData);
      setHistory(historyData);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Gagal memuat data Lead');
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleStatusChange(newStatus: LeadStatus) {
    const notes = window.prompt(`Catatan untuk perubahan ke ${newStatus} (opsional):`);
    if (notes === null) return;

    try {
      await updateLeadStatus(leadId, newStatus, notes || undefined);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Gagal mengubah status');
    }
  }

  function formatCurrency(value: string) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(Number(value));
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }

  if (loading) return <p className="text-sm text-gray-500">Memuat...</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!lead) return null;

  const canConvert =
    lead.status === 'WON' && !lead.spk && (role === 'SALES' || role === 'ADMIN');
  const canEditStatus = role === 'SALES' || role === 'ADMIN';

  return (
    <div>
      <button
        onClick={() => router.push('/leads')}
        className="mb-4 text-sm text-gray-500 hover:text-gray-700"
      >
        ← Kembali ke daftar Lead
      </button>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {lead.companyName}
            </h1>
            <p className="text-sm text-gray-500">{lead.contactName}</p>
          </div>
          <span className="rounded bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
            {lead.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <Field label="Telepon" value={lead.phone} />
          <Field label="Email" value={lead.email} />
          <Field label="Sumber" value={lead.source} />
          <Field label="Estimasi Nilai" value={formatCurrency(lead.estimatedValue)} />
          <Field label="Sales Penanggung Jawab" value={lead.sales?.name ?? '-'} />
          <Field
            label="SPK"
            value={lead.spk ? lead.spk.spkNumber : 'Belum ada SPK'}
          />
        </div>

        {lead.notes && (
          <div className="mt-4">
            <p className="text-xs font-medium uppercase text-gray-400">Catatan</p>
            <p className="text-sm text-gray-700">{lead.notes}</p>
          </div>
        )}

        {canEditStatus && (
          <div className="mt-6 border-t pt-4">
            <p className="mb-2 text-xs font-medium uppercase text-gray-400">
              Ubah Status
            </p>
            <div className="flex flex-wrap gap-2">
              {STATUS_FLOW.map((s) => (
                <button
                  key={s}
                  disabled={s === lead.status}
                  onClick={() => handleStatusChange(s)}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {canConvert && (
          <div className="mt-4">
            <button
              onClick={() => setShowConvertModal(true)}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Konversi ke SPK
            </button>
          </div>
        )}

        {lead.spk && (
          <div className="mt-4">
            <button
              onClick={() => router.push(`/spk/${lead.spk!.id}`)}
              className="text-sm text-blue-600 hover:underline"
            >
              Lihat SPK {lead.spk.spkNumber} →
            </button>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">
          Riwayat Status
        </h2>
        {history.length === 0 && (
          <p className="text-sm text-gray-400">Belum ada riwayat</p>
        )}
        <ul className="space-y-3">
          {history.map((h) => (
            <li key={h.id} className="border-l-2 border-gray-200 pl-4 text-sm">
              <p className="text-gray-700">
                <span className="font-medium">
                  {h.previousStatus ?? '(baru)'}
                </span>{' '}
                → <span className="font-medium">{h.newStatus}</span>
              </p>
              <p className="text-xs text-gray-500">
                {h.changedBy?.name ?? 'Sistem'} · {formatDate(h.createdAt)}
              </p>
              {h.notes && (
                <p className="mt-1 text-xs text-gray-600">"{h.notes}"</p>
              )}
            </li>
          ))}
        </ul>
      </div>

      {showConvertModal && (
        <ConvertToSpkModal
          leadId={leadId}
          onClose={() => setShowConvertModal(false)}
          onConverted={() => {
            setShowConvertModal(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-gray-400">{label}</p>
      <p className="text-gray-900">{value}</p>
    </div>
  );
}

function ConvertToSpkModal({
  leadId,
  onClose,
  onConverted,
}: {
  leadId: string;
  onClose: () => void;
  onConverted: () => void;
}) {
  const [projectName, setProjectName] = useState('');
  const [contractValue, setContractValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await convertLeadToSpk(leadId, {
        projectName,
        contractValue: Number(contractValue),
        startDate,
        endDate,
      });
      onConverted();
    } catch (err: any) {
      const message = err.response?.data?.message ?? 'Gagal membuat SPK';
      setError(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Konversi Lead ke SPK
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nama Proyek
            </label>
            <input
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nilai Kontrak (Rp)
            </label>
            <input
              type="number"
              required
              value={contractValue}
              onChange={(e) => setContractValue(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Tanggal Mulai
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Tanggal Selesai
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? 'Memproses...' : 'Konversi ke SPK'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}