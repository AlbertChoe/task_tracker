'use client';

import Link from 'next/link';
import StatsCards from '@/components/StatsCards';
import TaskTable from '@/components/TaskTable';

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl py-6">
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">
            Ringkasan progres tim & aktivitas terbaru.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/tasks"
            className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Semua Tugas
          </Link>
          <Link
            href="/tasks"
            className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            + Tugas Baru
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <StatsCards />

      {/* Single-column content */}
      <div className="mt-6">
        <section>
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5">
            <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="font-medium text-slate-900">Aktivitas Terbaru</h2>
              <Link
                href="/tasks"
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Lihat semua
              </Link>
            </header>

            {/*  your TaskTable */}
            <div className="p-5">
              <TaskTable limit={8} condensed />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
