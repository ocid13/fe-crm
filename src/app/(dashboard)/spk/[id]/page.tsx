'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getSpkById,
  sendSpkToFinance,
  reviewSpk,
  getSpkHistory,
  updateSpk,
} from '@/lib/api/spk';
import { Spk } from '@/types/spk';
import { StatusHistoryEntry } from '@/types/lead';
import { useAuthStore } from '@/lib/authStore';

export default function SpkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const spkId = params.id as string;
  const role = useAuthStore((state) => state.user?.role);

  const [spk, setSpk] = useState<Spk | null>(null);
  const [history, setHistory] = useState<StatusHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState<'APPROVED' | 'REJECTED' | null>(
    null,
  );
  const [editValue, setEditValue] = useState('');
  const [editing, setEditing] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [spkData, historyData] = await Promise.all([
        getSpkById(spkId),
        getSpkHistory(spkId),
      ]);
      setSpk(spkData);
      setHistory(historyData);
      setEditValue(spkData.contractValue);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Gagal memuat data SPK');
    } finally {
      setLoading(false);
    }
  }, [spkId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleSend() {
    if (!confirm('Kirim SPK ini ke Finance?')) return;
    try {
      await sendSpkToFinance(spkId);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Gagal mengirim SPK');
    }
  }

  async function handleUpdateValue() {
    setEditing(true);
    try {
      await updateSpk(spkId, { contractValue: Number(editValue) });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Gagal mengubah SPK');
    } finally {
      setEditing(false);
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
    return new Date(value).toLocaleDateString('id-ID', { dateStyle: 'medium' });
  }

  function formatDateTime(value: string) {
    return new Date(value).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }

  if (loading) return <p className="text-sm text-gray-500">Memuat...</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!spk) return null;

  const isApproved = spk.financeStatus === 'APPROVED';
  const canSend =
    (role === 'SALES' || role === 'ADMIN') && spk.salesStatus === 'DRAFT';
  const canEdit = (role === 'SALES' || role === 'ADMIN') && !isApproved;
  const canReview =
    (role === 'FINANCE' || role === 'ADMIN') &&
    spk.salesStatus === 'SENT' &&
    spk.financeStatus === 'PENDING';

  return (
    <div>
      <button
        onClick={() => router.push('/spk')}
        className="mb-4 text-sm text-gray-500 hover:text-gray-700"
      >
        ← Kembali ke daftar SPK
      </button>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {spk.spkNumber}
            </h1>
            <p className="text-sm text-gray-500">{spk.projectName}</p>
          </div>
          <div className="flex gap-2">
            <span className="rounded bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
              {spk.salesStatus}
            </span>
            <span className="rounded bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
              {spk.financeStatus}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <Field label="Perusahaan" value={spk.lead?.companyName ?? '-'} />
          <Field label="Kontak" value={spk.lead?.contactName ?? '-'} />
          <Field label="Tanggal Mulai" value={formatDate(spk.startDate)} />
          <Field label="Tanggal Selesai" value={formatDate(spk.endDate)} />
        </div>

        <div className="mt-4">
          <p className="text-xs font-medium uppercase text-gray-400">
            Nilai Kontrak
          </p>
          {canEdit ? (
            <div className="mt-1 flex gap-2">
              <input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-48 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={handleUpdateValue}
                disabled={editing}
                className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              >
                Simpan
              </button>
            </div>
          ) : (
            <p className="text-gray-900">{formatCurrency(spk.contractValue)}</p>
          )}
        </div>

        {spk.financeNotes && (
          <div className="mt-4">
            <p className="text-xs font-medium uppercase text-gray-400">
              Catatan Finance
            </p>
            <p className="text-sm text-gray-700">{spk.financeNotes}</p>
          </div>
        )}

        {isApproved && (
          <p className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
            SPK ini sudah disetujui dan tidak dapat diubah Sales.
          </p>
        )}

        <div className="mt-6 flex gap-2 border-t pt-4">
          {canSend && (
            <button
              onClick={handleSend}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Kirim ke Finance
            </button>
          )}

          {canReview && (
            <>
              <button
                onClick={() => setShowReviewModal('APPROVED')}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                Setujui
              </button>
              <button
                onClick={() => setShowReviewModal('REJECTED')}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Tolak
              </button>
            </>
          )}
        </div>
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
                <span className="font-medium">{h.previousStatus ?? '(baru)'}</span>{' '}
                → <span className="font-medium">{h.newStatus}</span>
              </p>
              <p className="text-xs text-gray-500">
                {h.changedBy?.name ?? 'Sistem'} · {formatDateTime(h.createdAt)}
              </p>
              {h.notes && (
                <p className="mt-1 text-xs text-gray-600">"{h.notes}"</p>
              )}
            </li>
          ))}
        </ul>
      </div>

      {showReviewModal && (
        <ReviewModal
          spkId={spkId}
          decision={showReviewModal}
          onClose={() => setShowReviewModal(null)}
          onReviewed={() => {
            setShowReviewModal(null);
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

function ReviewModal({
  spkId,
  decision,
  onClose,
  onReviewed,
}: {
  spkId: string;
  decision: 'APPROVED' | 'REJECTED';
  onClose: () => void;
  onReviewed: () => void;
}) {
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isReject = decision === 'REJECTED';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (isReject && !notes.trim()) {
      setError('Catatan wajib diisi jika SPK ditolak');
      return;
    }

    setSubmitting(true);
    try {
      await reviewSpk(spkId, decision, notes || undefined);
      onReviewed();
    } catch (err: any) {
      const message = err.response?.data?.message ?? 'Gagal memproses verifikasi';
      setError(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          {isReject ? 'Tolak SPK' : 'Setujui SPK'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Catatan Verifikasi {isReject && <span className="text-red-500">*wajib</span>}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder={
                isReject
                  ? 'Jelaskan alasan penolakan...'
                  : 'Catatan tambahan (opsional)'
              }
            />
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
              className={`rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
                isReject ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {submitting ? 'Memproses...' : isReject ? 'Tolak SPK' : 'Setujui SPK'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}