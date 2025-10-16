'use client';

import useSWR from 'swr';
import { api } from '@/lib/api';

type Summary = {
  total: number;
  by_status: {
    BELUM_DIMULAI?: number;
    SEDANG_DIKERJAKAN?: number;
    SELESAI?: number;
    [k: string]: number | undefined;
  };
  overdue: number;
  due_soon: number;
  wip_by_assignee: { assignee: string; count: number }[];
};

function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
      <div className="mb-3 h-4 w-24 animate-pulse rounded bg-slate-200" />
      <div className="h-7 w-16 animate-pulse rounded bg-slate-200" />
    </div>
  );
}

export default function StatsCards() {
  const { data, isLoading, error } = useSWR<Summary>(
    '/dashboard/summary',
    (url: string) => api<Summary>(url),
  );

  if (isLoading) {
    return (
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Failed to load dashboard summary.
      </div>
    );
  }

  const total = data.total ?? 0;
  const inProgress = data.by_status?.SEDANG_DIKERJAKAN ?? 0;
  const done = data.by_status?.SELESAI ?? 0;
  const overdue = data.overdue ?? 0;
  const dueSoon = data.due_soon ?? 0;

  const cards = [
    {
      label: 'Total tasks',
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
      label: 'In progress',
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
      label: 'Completed',
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
    {
      label: 'Overdue',
      value: overdue,
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-rose-600"
        >
          <path d="M12 6v6m0 0l4 2M12 12l-4 2" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* KPI strip for due soon (subtle emphasis) */}
      <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-sky-500" />
            <span className="text-sm text-slate-500">Due in ≤ 3 days</span>
            <strong className="ml-1 text-slate-900">{dueSoon}</strong>
          </div>
          <div className="text-xs text-slate-400">
            Prioritize these tasks to keep them from becoming overdue.
          </div>
        </div>
      </div>
    </>
  );
}
