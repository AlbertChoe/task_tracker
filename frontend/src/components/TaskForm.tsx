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
  BELUM_DIMULAI: 'Not started',
  SEDANG_DIKERJAKAN: 'In progress',
  SELESAI: 'Completed',
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

function getJakartaLocalDateTimeString() {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value || '';

  const y = get('year');
  const m = get('month');
  const d = get('day');
  const h = get('hour');
  const min = get('minute');

  return `${y}-${m}-${d}T${h}:${min}`;
}

function cleanTaskPayload(data: Inputs): Partial<Task> {
  const title = trimOrNull(data.title) ?? '';
  const description = trimOrNull(data.description) ?? undefined;
  const assignee = trimOrNull(data.assignee) ?? undefined;

  const status = (data.status ?? 'BELUM_DIMULAI') as Task['status'];

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
        ? new Date(initial.completed_at).toISOString().slice(0, 16)
        : '',
    },
  });

  const status = watch('status');

  useEffect(() => {
    if (status === 'SELESAI') {
      const nowJakarta = getJakartaLocalDateTimeString();
      setValue('completed_at', nowJakarta);
    } else {
      setValue('completed_at', '');
    }
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
          Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          placeholder="e.g. Implement auth API"
          {...register('title', { required: 'Title is required' })}
        />
        {errors.title && (
          <p className="text-xs text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Work details, acceptance criteria, etc."
          {...register('description')}
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="assignee">Assignee</Label>
          <Input
            id="assignee"
            placeholder="Person in charge"
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
                  <SelectValue placeholder="Select status" />
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
          <Label htmlFor="start_date">Start date</Label>
          <Input id="start_date" type="date" {...register('start_date')} />
          <p className="text-xs text-muted-foreground">
            Optional. Format: YYYY-MM-DD
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="due_date">Due date</Label>
          <Input id="due_date" type="date" {...register('due_date')} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="completed_at">Completed at</Label>
          <Input
            id="completed_at"
            type="datetime-local"
            disabled={status !== 'SELESAI'}
            {...register('completed_at')}
          />
          <p className="text-xs text-muted-foreground">
            Automatically filled when status is <b>Completed</b>.
          </p>
        </div>
      </div>

      <div className="pt-1">
        <Button
          disabled={isSubmitting}
          type="submit"
          className="w-full sm:w-auto"
        >
          {isSubmitting ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  );
}
