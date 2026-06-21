'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/authStore';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, accessToken, logout, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (hasHydrated && !accessToken) {
      router.replace('/login');
    }
  }, [hasHydrated, accessToken, router]);

  if (!hasHydrated || !accessToken) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">
        Memuat...
      </div>
    );
  }

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-gray-900">CRM Lead &amp; SPK</span>
            <Link
              href="/leads"
              className="text-sm text-gray-600 hover:text-blue-600"
            >
              Leads
            </Link>
            <Link
              href="/spk"
              className="text-sm text-gray-600 hover:text-blue-600"
            >
              SPK
            </Link>
            {user?.role === 'ADMIN' && (
              <Link
                href="/users"
                className="text-sm text-gray-600 hover:text-blue-600"
              >
                Users
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {user?.name}{' '}
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                {user?.role}
              </span>
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:underline"
            >
              Keluar
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}