'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Task } from '@/types';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type Inputs = Omit<
  Task,
  'id' | 'created_at' | 'completed_at' | 'created_by'
> & {
  completed_at?: string | null;
};

const STATUS = {
  BELUM_DIMULAI: 'Belum Dimulai',
  SEDANG_DIKERJAKAN: 'Sedang Dikerjakan',
  SELESAI: 'Selesai',
} as const;

function trimOrNull(v?: string | null) {
  if (v == null) return null;
  const t = v.trim();
  return t.length ? t : null;
}

function toISOStringOrNull(v?: string | null) {
  const t = trimOrNull(v);
  if (!t) return null;
  const withSeconds = t.length === 16 ? `${t}:00` : t;
  const d = new Date(withSeconds);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

function cleanTaskPayload(data: Inputs): Partial<Task> {
  // Normalize and coerce
  const title = trimOrNull(data.title) ?? ''; // required
  const description = trimOrNull(data.description) ?? undefined;
  const assignee = trimOrNull(data.assignee) ?? undefined;

  const status = (data.status ?? 'BELUM_DIMULAI') as Task['status']; // safe default

  // Dates: keep as string (FastAPI/Pydantic will parse), or null/undefined
  const start_date =
    trimOrNull((data as any).start_date as string | null) ?? undefined;
  const due_date =
    trimOrNull((data as any).due_date as string | null) ?? undefined;

  const completed_at =
    status === 'SELESAI'
      ? toISOStringOrNull(data.completed_at ?? null) ?? undefined
      : undefined;

  return {
    title,
    description,
    assignee,
    status,
    start_date,
    due_date,
    completed_at,
  };
}

export default function TaskForm({
  onSubmit,
  initial,
  className,
}: {
  onSubmit: (data: Partial<Task>) => void;
  initial?: Partial<Task>;
  className?: string;
}) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<Inputs>({
    defaultValues: {
      title: initial?.title ?? '',
      description: initial?.description ?? '',
      assignee: initial?.assignee ?? '',
      status: (initial?.status as Inputs['status']) ?? 'BELUM_DIMULAI',
      start_date: (initial as any)?.start_date ?? '',
      due_date: (initial as any)?.due_date ?? '',
      completed_at: initial?.completed_at
        ? new Date(initial.completed_at).toISOString().slice(0, 16) // to datetime-local
        : '',
    },
  });

  const status = watch('status');

  useEffect(() => {
    if (status !== 'SELESAI') setValue('completed_at', '');
  }, [status, setValue]);

  async function submit(data: Inputs) {
    const cleaned = cleanTaskPayload(data);
    await onSubmit(cleaned);
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className={cn('space-y-4', className)}
    >
      <div className="space-y-1.5">
        <Label htmlFor="title">
          Judul <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          placeholder="Mis. Implementasi API Auth"
          {...register('title', { required: 'Judul wajib diisi' })}
        />
        {errors.title && (
          <p className="text-xs text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          placeholder="Detail pekerjaan, acceptance criteria, dsb."
          {...register('description')}
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="assignee">Assignee</Label>
          <Input
            id="assignee"
            placeholder="Nama PIC"
            {...register('assignee')}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Status</Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BELUM_DIMULAI">
                    {STATUS.BELUM_DIMULAI}
                  </SelectItem>
                  <SelectItem value="SEDANG_DIKERJAKAN">
                    {STATUS.SEDANG_DIKERJAKAN}
                  </SelectItem>
                  <SelectItem value="SELESAI">{STATUS.SELESAI}</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="start_date">Mulai</Label>
          <Input id="start_date" type="date" {...register('start_date')} />
          <p className="text-xs text-muted-foreground">
            Opsional. Format: YYYY-MM-DD
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="due_date">Jatuh Tempo</Label>
          <Input id="due_date" type="date" {...register('due_date')} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="completed_at">Selesai Pada</Label>
          <Input
            id="completed_at"
            type="datetime-local"
            disabled={status !== 'SELESAI'}
            {...register('completed_at')}
          />
          <p className="text-xs text-muted-foreground">
            Aktif jika status <b>Selesai</b>.
          </p>
        </div>
      </div>

      <div className="pt-1">
        <Button
          disabled={isSubmitting}
          type="submit"
          className="w-full sm:w-auto"
        >
          {isSubmitting ? 'Menyimpan…' : 'Simpan'}
        </Button>
      </div>
    </form>
  );
}
