import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-900/90 text-2xl font-bold text-white shadow-lg">
        404
      </div>
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Sorry, we couldn&apos;t locate that page. Double-check the URL or go
          back to the dashboard to continue working.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800"
        >
          Back to dashboard
        </Link>
        <Link
          href="/tasks"
          className="inline-flex items-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
        >
          View all tasks
        </Link>
      </div>
    </div>
  );
}
