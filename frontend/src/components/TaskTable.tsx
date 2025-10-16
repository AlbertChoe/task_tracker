'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import StatusBadge from './StatusBadge';
import { Task } from '@/types';

interface Props {
  limit?: number;
  condensed?: boolean;
}

export default function TaskTable({ limit, condensed }: Props) {
  const [status, setStatus] = useState('');
  const [qRaw, setQRaw] = useState('');
  const [q, setQ] = useState('');

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => setQ(qRaw), 300);
    return () => clearTimeout(t);
  }, [qRaw]);

  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (q) params.set('q', q);
  if (limit) params.set('limit', String(limit));
  params.set('order', 'desc');

  const key = `/tasks?${params.toString()}`;

  const { data, mutate, isLoading, error } = useSWR<any>(key, (url: string) =>
    api<any>(url),
  );

  const items: Task[] = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.data)) return data.data;
    return [];
  }, [data]);

  async function remove(id: string) {
    if (!confirm('Hapus tugas ini?')) return;
    await api(`/tasks/${id}`, { method: 'DELETE' });
    mutate();
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <select
          aria-label="Filter status"
          className="rounded-lg border px-2 py-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Semua status</option>
          <option value="BELUM_DIMULAI">Belum Dimulai</option>
          <option value="SEDANG_DIKERJAKAN">Sedang Dikerjakan</option>
          <option value="SELESAI">Selesai</option>
        </select>
        <input
          aria-label="Cari tugas"
          className="w-full rounded-lg border px-3 py-2 text-sm sm:w-64"
          placeholder="Cari judul/assignee..."
          value={qRaw}
          onChange={(e) => setQRaw(e.target.value)}
        />
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className={`${cellCls(condensed)} text-left`}>Judul</th>
              <th className={`${cellCls(condensed)} text-left`}>Assignee</th>
              <th className={`${cellCls(condensed)} text-left`}>Status</th>
              <th className={`${cellCls(condensed)} text-left`}>Tanggal</th>
              <th className={`${cellCls(condensed)} w-40 text-right`}></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td
                  className={`${cellCls(condensed)} text-slate-400`}
                  colSpan={5}
                >
                  Memuat…
                </td>
              </tr>
            )}

            {!isLoading && !error && items.length === 0 && (
              <tr>
                <td className={`${cellCls(condensed)}`} colSpan={5}>
                  <div className="py-10 text-center text-slate-500">
                    Belum ada tugas yang cocok.
                  </div>
                </td>
              </tr>
            )}

            {error && (
              <tr>
                <td
                  className={`${cellCls(condensed)} text-red-600`}
                  colSpan={5}
                >
                  Gagal memuat: {String(error?.message || 'Unknown error')}
                </td>
              </tr>
            )}

            {items.map((t) => (
              <tr
                key={t.id}
                className="border-t border-slate-100 hover:bg-slate-50/60"
              >
                <td className={cellCls(condensed)}>
                  <div className="line-clamp-1 font-medium text-slate-900">
                    {t.title}
                  </div>
                  <div className="line-clamp-1 text-xs text-slate-500">
                    {t.description || '—'}
                  </div>
                </td>
                <td className={cellCls(condensed)}>{t.assignee || '-'}</td>
                <td className={cellCls(condensed)}>
                  <StatusBadge status={t.status} />
                </td>
                <td className={cellCls(condensed)}>
                  <div>Start: {t.start_date || '-'}</div>
                  <div>Due: {t.due_date || '-'}</div>
                </td>
                <td className={`${cellCls(condensed)} space-x-2 text-right`}>
                  <Link
                    href={`/tasks/${t.id}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50"
                  >
                    Detail
                  </Link>
                  <button
                    onClick={() => remove(t.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-red-600 hover:bg-red-50"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function cellCls(condensed?: boolean) {
  return condensed ? 'px-3 py-2' : 'px-4 py-3';
}
