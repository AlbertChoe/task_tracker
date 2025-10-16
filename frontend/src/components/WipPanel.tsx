'use client';

import useSWR from 'swr';
import { api } from '@/lib/api';

type WipRow = { assignee: string; count: number };
type Summary = { wip_by_assignee: WipRow[] };

export default function WipPanel() {
  const { data, isLoading } = useSWR<Summary>(
    '/dashboard/summary',
    (url: string) => api<Summary>(url),
  );

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
      <h3 className="font-medium text-slate-900">Work in progress by assignee</h3>

      {isLoading && (
        <div className="mt-4 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-10 animate-pulse rounded-xl bg-slate-100"
            />
          ))}
        </div>
      )}

      {!isLoading && (
        <ul className="mt-4 space-y-2">
          {data?.wip_by_assignee?.length ? (
            data.wip_by_assignee.map((row) => (
              <li
                key={row.assignee}
                className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-700">
                    {initials(row.assignee)}
                  </div>
                  <span className="text-sm text-slate-800">{row.assignee}</span>
                </div>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                  {row.count} WIP
                </span>
              </li>
            ))
          ) : (
            <li className="rounded-xl border border-slate-200 px-3 py-4 text-center text-sm text-slate-500">
              No work in progress recorded yet.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

function initials(name: string) {
  const parts = (name || '').trim().split(/\s+/);
  return (
    (parts[0]?.[0] || '').toUpperCase() + (parts[1]?.[0] || '').toUpperCase()
  );
}
