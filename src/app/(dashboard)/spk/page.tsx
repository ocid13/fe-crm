'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSpkList } from '@/lib/api/spk';
import { Spk } from '@/types/spk';

const FINANCE_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

const SALES_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SENT: 'bg-blue-100 text-blue-700',
};

export default function SpkPage() {
  const router = useRouter();
  const [spkList, setSpkList] = useState<Spk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSpkList()
      .then(setSpkList)
      .finally(() => setLoading(false));
  }, []);

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

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-gray-900">SPK</h1>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">No. SPK</th>
              <th className="px-4 py-3">Proyek</th>
              <th className="px-4 py-3">Perusahaan</th>
              <th className="px-4 py-3">Nilai Kontrak</th>
              <th className="px-4 py-3">Periode</th>
              <th className="px-4 py-3">Status Sales</th>
              <th className="px-4 py-3">Status Finance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                  Memuat...
                </td>
              </tr>
            )}
            {!loading && spkList.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                  Belum ada SPK
                </td>
              </tr>
            )}
            {!loading &&
              spkList.map((spk) => (
                <tr
                  key={spk.id}
                  onClick={() => router.push(`/spk/${spk.id}`)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {spk.spkNumber}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{spk.projectName}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {spk.lead?.companyName ?? '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatCurrency(spk.contractValue)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(spk.startDate)} – {formatDate(spk.endDate)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-1 text-xs font-medium ${SALES_COLORS[spk.salesStatus]}`}
                    >
                      {spk.salesStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-1 text-xs font-medium ${FINANCE_COLORS[spk.financeStatus]}`}
                    >
                      {spk.financeStatus}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}