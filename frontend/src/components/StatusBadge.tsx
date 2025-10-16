import React from 'react';
import { Status } from '@/types';

const LABEL: Record<Status, string> = {
  BELUM_DIMULAI: 'Belum dimulai',
  SEDANG_DIKERJAKAN: 'Sedang dikerjakan',
  SELESAI: 'Selesai',
};

const COLOR: Record<Status, string> = {
  BELUM_DIMULAI: 'bg-slate-50 text-slate-700 ring-slate-200',
  SEDANG_DIKERJAKAN: 'bg-amber-50 text-amber-700 ring-amber-200',
  SELESAI: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

const SIZE = {
  sm: 'text-[11px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
} as const;

export default function StatusBadge({
  status,
  size = 'sm',
  className = '',
}: {
  status: Status;
  size?: 'sm' | 'md';
  className?: string;
}) {
  return (
    <span
      className={[
        'inline-flex items-center whitespace-nowrap rounded-full font-medium leading-none ring-1 ring-inset',
        COLOR[status],
        SIZE[size],
        className,
      ].join(' ')}
    >
      {LABEL[status]}
    </span>
  );
}
