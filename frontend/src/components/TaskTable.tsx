'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import StatusBadge from './StatusBadge';
import { Task } from '@/types';
import { formatDate } from '@/lib/datetime';

interface Props {
  limit?: number;
  condensed?: boolean;
}

export default function TaskTable({ limit, condensed }: Props) {
  const isPaginated = !limit;
  const [status, setStatus] = useState('');
  const [qRaw, setQRaw] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  useEffect(() => {
    const t = setTimeout(() => setQ(qRaw), 300);
    return () => clearTimeout(t);
  }, [qRaw]);

  useEffect(() => {
    if (!isPaginated && page !== 1) {
      setPage(1);
    }
  }, [isPaginated, page]);

  useEffect(() => {
    if (isPaginated) {
      setPage(1);
    }
  }, [status, q, isPaginated]);

  const effectivePage = isPaginated ? page : 1;
  const effectiveSize = limit ?? size;

  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (q) params.set('q', q);
  params.set('page', String(effectivePage));
  params.set('size', String(effectiveSize));

  const search = params.toString();
  const key = `/tasks${search ? `?${search}` : ''}`;

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

  useEffect(() => {
    if (!isPaginated) return;
    if (!isLoading && items.length === 0 && page > 1) {
      setPage((prev) => Math.max(1, prev - 1));
    }
  }, [isPaginated, isLoading, items.length, page]);

  async function remove(id: string) {
    if (!confirm('Delete this task?')) return;
    await api(`/tasks/${id}`, { method: 'DELETE' });
    mutate();
  }

  const startIndex = items.length ? (effectivePage - 1) * effectiveSize + 1 : 0;
  const endIndex = items.length ? startIndex + items.length - 1 : 0;
  const canPrev = isPaginated && page > 1;
  const canNext = isPaginated && items.length === effectiveSize;

  return (
    <div>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <select
          aria-label="Filter status"
          className="rounded-lg border px-2 py-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="BELUM_DIMULAI">Not started</option>
          <option value="SEDANG_DIKERJAKAN">In progress</option>
          <option value="SELESAI">Completed</option>
        </select>
        <input
          aria-label="Search tasks"
          className="w-full rounded-lg border px-3 py-2 text-sm sm:w-64"
          placeholder="Search title or assignee..."
          value={qRaw}
          onChange={(e) => setQRaw(e.target.value)}
        />
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className={`${cellCls(condensed)} text-left`}>Title</th>
              <th className={`${cellCls(condensed)} text-left`}>Assignee</th>
              <th className={`${cellCls(condensed)} text-left`}>Status</th>
              <th className={`${cellCls(condensed)} text-left`}>Dates</th>
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
                  Loading…
                </td>
              </tr>
            )}

            {!isLoading && !error && items.length === 0 && (
              <tr>
                <td className={`${cellCls(condensed)}`} colSpan={5}>
                  <div className="py-10 text-center text-slate-500">
                    No matching tasks found.
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
                  Failed to load: {String(error?.message || 'Unknown error')}
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
                  <div>Start: {formatDate(t.start_date ?? '')}</div>
                  <div>Due: {formatDate(t.due_date ?? '')}</div>
                </td>
                <td className={`${cellCls(condensed)} space-x-2 text-right`}>
                  <Link
                    href={`/tasks/${t.id}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50"
                  >
                    Details
                  </Link>
                  <button
                    onClick={() => remove(t.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isPaginated && (
        <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-slate-500">
            {items.length
              ? `Showing ${startIndex}–${endIndex}`
              : 'Nothing to display'}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span>Tampil</span>
              <select
                value={effectiveSize}
                onChange={(e) => {
                  setSize(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-lg border px-2 py-1 text-sm"
              >
                {[10, 20, 50].map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <span>per page</span>
            </div>
            <div className="inline-flex overflow-hidden rounded-lg border border-slate-200 shadow-sm">
              <button
                type="button"
                onClick={() => canPrev && setPage((prev) => prev - 1)}
                disabled={!canPrev}
                className="px-3 py-2 text-sm text-slate-600 transition-colors enabled:hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="flex items-center border-l border-r border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                Page {effectivePage}
              </span>
              <button
                type="button"
                onClick={() => canNext && setPage((prev) => prev + 1)}
                disabled={!canNext}
                className="px-3 py-2 text-sm text-slate-600 transition-colors enabled:hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function cellCls(condensed?: boolean) {
  return condensed ? 'px-3 py-2' : 'px-4 py-3';
}
