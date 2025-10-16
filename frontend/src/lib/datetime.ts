const DEFAULT_LOCALE = 'en-GB';

export function formatDateTime(
  value: string | number | Date,
  options?: Intl.DateTimeFormatOptions,
  timeZone = 'Asia/Jakarta',
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  const formatter = new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
    ...options,
  });
  return formatter.format(date);
}

export function formatDate(
  value: string | number | Date,
  options?: Intl.DateTimeFormatOptions,
  timeZone = 'Asia/Jakarta',
): string {
  return formatDateTime(
    value,
    {
      hour: undefined,
      minute: undefined,
      ...options,
    },
    timeZone,
  );
}

export function formatRelativeDueDate(
  value: string | number | Date | null | undefined,
  timeZone = 'Asia/Jakarta',
): string {
  if (!value) return '-';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  const dayFormatter = new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    weekday: 'long',
    timeZone,
  });
  const base = formatDate(date, undefined, timeZone);
  return `${base} (${dayFormatter.format(date)})`;
}
