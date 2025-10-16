'use client';

import Link from 'next/link';
import StatsCards from '@/components/StatsCards';
import TaskTable from '@/components/TaskTable';
import WipPanel from '@/components/WipPanel';

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
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

      <StatsCards />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
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

            <div className="p-5">
              <TaskTable limit={8} condensed />
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <WipPanel />

          <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-indigo-50 to-sky-50 p-5">
            <h3 className="font-medium text-slate-900">Tips singkat</h3>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
              <li>
                Prioritaskan tugas <strong>Overdue</strong> lebih dulu.
              </li>
              <li>Gunakan filter status di halaman Tugas.</li>
              <li>Tambahkan catatan tiap perubahan status.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
