'use client';

import useSWR from 'swr';
import { api } from '@/lib/api';
import { Task, TaskLog } from '@/types';
import TaskForm from '@/components/TaskForm';
import StatusBadge from '@/components/StatusBadge';
import { useState } from 'react';
import { useSWRConfig } from 'swr';
import { formatDateTime } from '@/lib/datetime';

export default function TaskDetail({ params }: { params: { id: string } }) {
  const { mutate: mutateGlobal } = useSWRConfig();

  const {
    data: task,
    mutate,
    isLoading,
  } = useSWR<Task>(`/tasks/${params.id}`, (url: string) => api<Task>(url));
  const {
    data: logs,
    mutate: mutLogs,
    isLoading: logsLoading,
  } = useSWR<TaskLog[]>(`/tasks/${params.id}/logs`, (url: string) =>
    api<TaskLog[]>(url),
  );

  async function updateTask(data: Partial<Task>) {
    await api(`/tasks/${params.id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    mutate();
    mutLogs();
    mutateGlobal(
      (key) => typeof key === 'string' && key.startsWith('/tasks'),
      undefined,
      { revalidate: true },
    );
  }

  const [event, setEvent] = useState('');
  const [detail, setDetail] = useState('');
  const [adding, setAdding] = useState(false);

  async function addLog(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    try {
      await api(`/tasks/${params.id}/logs`, {
        method: 'POST',
        body: JSON.stringify({ event, detail }),
      });
      setEvent('');
      setDetail('');
      mutLogs();
    } finally {
      setAdding(false);
    }
  }

  if (isLoading || !task) {
    return (
      <div className="mx-auto max-w-7xl  py-6">
        <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl  py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Task details</h1>
        <p className="text-slate-500">
          Update task information and add activity notes.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-medium text-slate-900 line-clamp-1">
              {task.title}
            </h2>
            <StatusBadge status={task.status} />
          </div>
          <TaskForm onSubmit={updateTask} initial={task} />
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
          <h2 className="mb-3 font-medium text-slate-900">Activity log</h2>

          <form onSubmit={addLog} className="mb-4 flex gap-2">
            <input
              name="event"
              value={event}
              onChange={(e) => setEvent(e.target.value)}
              className="w-40 rounded-lg border px-2 py-2 text-sm"
              placeholder="Event (e.g. COMMENT)"
            />
            <input
              name="detail"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              className="flex-1 rounded-lg border px-2 py-2 text-sm"
              placeholder="Details"
            />
            <button
              disabled={adding}
              className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50"
            >
              {adding ? 'Adding…' : 'Add'}
            </button>
          </form>

          {logsLoading && (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          )}

          {!logsLoading && (
            <ul className="space-y-2">
              {logs?.map((l) => (
                <li key={l.id} className="rounded border p-3 text-sm">
                  <div className="font-mono text-xs text-slate-500">
                    {formatDateTime(l.created_at)}
                  </div>
                  <div className="font-semibold">{l.event}</div>
                  <div className="text-slate-700">{l.detail || '-'}</div>
                </li>
              ))}
              {!logs?.length && (
                <li className="rounded border p-4 text-center text-sm text-slate-500">
                  No activity yet.
                </li>
              )}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
