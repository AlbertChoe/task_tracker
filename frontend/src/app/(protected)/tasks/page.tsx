'use client';

import TaskForm from '@/components/TaskForm';
import TaskTable from '@/components/TaskTable';
import { api } from '@/lib/api';
import { useSWRConfig } from 'swr';

export default function TasksPage() {
  const { mutate } = useSWRConfig();

  async function createTask(data: any) {
    await api('/tasks', { method: 'POST', body: JSON.stringify(data) });
    mutate(
      (key) => typeof key === 'string' && key.startsWith('/tasks'),
      undefined,
      { revalidate: true },
    );
  }

  return (
    <div className="mx-auto max-w-7xl  py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Tasks</h1>
        <p className="text-slate-500">
          Kelola tugas, tambah task baru, dan pantau progres.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
          <h2 className="mb-3 font-medium text-slate-900">Tambah Task</h2>
          <TaskForm onSubmit={createTask} />
        </section>

        <section>
          <TaskTable />
        </section>
      </div>
    </div>
  );
}
