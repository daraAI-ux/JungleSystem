const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isKolamIsoDate(value: string) {
  if (!ISO_DATE_PATTERN.test(value.trim())) {
    return false;
  }
  return parseKolamIsoDate(value) != null;
}

export function parseKolamIsoDate(value: string): Date | null {
  const match = ISO_DATE_PATTERN.exec(value.trim());
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

export function formatKolamIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatKolamDateLabel(value: string, emptyLabel = 'Pilih tanggal') {
  const date = parseKolamIsoDate(value);
  if (!date) {
    return emptyLabel;
  }
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function getKolamCalendarMonthLabel(year: number, monthIndex: number) {
  const date = new Date(year, monthIndex, 1);
  return date.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });
}

/** Monday-first week index: Mon=0 … Sun=6 */
export function getKolamMondayFirstWeekday(date: Date) {
  return (date.getDay() + 6) % 7;
}

export function buildKolamCalendarCells(year: number, monthIndex: number) {
  const first = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const leading = getKolamMondayFirstWeekday(first);
  const cells: Array<{
    day: number | null;
    iso: string | null;
    inMonth: boolean;
  }> = [];

  for (let i = 0; i < leading; i += 1) {
    cells.push({ day: null, iso: null, inMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, monthIndex, day);
    cells.push({
      day,
      iso: formatKolamIsoDate(date),
      inMonth: true,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ day: null, iso: null, inMonth: false });
  }

  return cells;
}

export const KOLAM_CALENDAR_WEEKDAY_LABELS = [
  'Sen',
  'Sel',
  'Rab',
  'Kam',
  'Jum',
  'Sab',
  'Min',
] as const;
