'use client';

import useSWR from 'swr';
import { api } from '@/lib/api';

type DashboardSummary = {
  total: number;
  by_status: {
    BELUM_DIMULAI?: number;
    SEDANG_DIKERJAKAN?: number;
    SELESAI?: number;
    [k: string]: number | undefined;
  };
};

function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
      <div className="h-4 w-24 animate-pulse rounded bg-slate-200 mb-3" />
      <div className="h-7 w-16 animate-pulse rounded bg-slate-200" />
    </div>
  );
}

export default function StatsCards() {
  const { data, isLoading } = useSWR<DashboardSummary>(
    '/dashboard/summary',
    (url: string) => api<DashboardSummary>(url),
  );

  if (isLoading) {
    return (
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  const total = data?.total ?? 0;
  const inProgress = data?.by_status?.SEDANG_DIKERJAKAN ?? 0;
  const done = data?.by_status?.SELESAI ?? 0;

  const cards = [
    {
      label: 'Total Tugas',
      value: total,
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-slate-700"
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
    },
    {
      label: 'Sedang Dikerjakan',
      value: inProgress,
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-amber-600"
        >
          <path d="M12 6v6l4 2" />
        </svg>
      ),
    },
    {
      label: 'Selesai',
      value: done,
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-emerald-600"
        >
          <path d="M5 12l4 4 10-10" />
        </svg>
      ),
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((c, i) => (
        <div
          key={i}
          className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5 transition hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">{c.label}</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {c.value}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">
              {c.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
