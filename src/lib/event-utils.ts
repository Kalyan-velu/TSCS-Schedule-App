import { Linking, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import type { Event as ApiEvent } from '@/lib/api';

export type ClassItem = {
  id: string;
  subject: string;
  description: string;
  meetLink: string | null;
  startTime: string;
  endTime: string;
  color: string;
  startDate: Date;
  endDate: Date;
};

export const EVENT_COLORS = ['#3c87f7'];

export function colorForTitle(title: string): string {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = title.charCodeAt(i) + ((h << 5) - h);
  return EVENT_COLORS[Math.abs(h) % EVENT_COLORS.length];
}

export function toClassItem(event: ApiEvent): ClassItem {
  const start = new Date(event.scheduledAt);
  const end = new Date(start.getTime() + event.durationMinutes * 60_000);
  const fmt = (d: Date) =>
    `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return {
    id: event.id,
    subject: event.title,
    description: event.description ?? '',
    meetLink: event.meetLink,
    startTime: fmt(start),
    endTime: fmt(end),
    color: colorForTitle(event.title),
    startDate: start,
    endDate: end,
  };
}

export function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

export async function handleJoinMeeting(url: string): Promise<void> {
  try {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      await WebBrowser.openBrowserAsync(url);
    } else {
      await Linking.openURL(url);
    }
  } catch (err) {
    console.error('Failed to open meeting link:', err);
  }
}

export async function addEventToCalendar(item: ClassItem): Promise<void> {
  const fmtGcal = (d: Date) =>
    d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const gcalUrl =
    `https://calendar.google.com/calendar/render?action=TEMPLATE` +
    `&text=${encodeURIComponent(item.subject)}` +
    `&dates=${fmtGcal(item.startDate)}/${fmtGcal(item.endDate)}` +
    `&details=${encodeURIComponent(item.description ?? '')}` +
    (item.meetLink ? `&location=${encodeURIComponent(item.meetLink)}` : '');

  if (Platform.OS === 'ios') {
    const APPLE_EPOCH_OFFSET = 978307200;
    const ts = Math.floor(item.startDate.getTime() / 1000) - APPLE_EPOCH_OFFSET;
    const calUrl = `calshow:${ts}`;
    const canOpen = await Linking.canOpenURL(calUrl);
    await Linking.openURL(canOpen ? calUrl : gcalUrl);
    return;
  }

  if (Platform.OS === 'android') {
    const startMs = item.startDate.getTime();
    const endMs = item.endDate.getTime();
    const intentUrl =
      `content://com.android.calendar/time/${startMs}` +
      `?beginTime=${startMs}&endTime=${endMs}` +
      `&title=${encodeURIComponent(item.subject)}` +
      `&description=${encodeURIComponent(item.description ?? '')}` +
      (item.meetLink ? `&eventLocation=${encodeURIComponent(item.meetLink)}` : '');
    const canOpen = await Linking.canOpenURL(intentUrl);
    await Linking.openURL(canOpen ? intentUrl : gcalUrl);
    return;
  }

  await Linking.openURL(gcalUrl);
}

/* ── Week / day helpers ─────────────────────────────────────── */

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export type Day = (typeof DAYS)[number];

/** Maps JS Date#getDay() (0 = Sun … 6 = Sat) → DAYS index (0 = Mon … 6 = Sun) */
export const DAY_BY_INDEX: Record<number, Day> = {
  0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat',
};

/** Today's index into DAYS (0 = Mon … 6 = Sun) */
export function getTodayDayIndex(): number {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}

/** Date for the day at `dayIndex` (0 = Mon) relative to `weekStart` */
export function dateForDayIndex(weekStart: Date, dayIndex: number): Date {
  const d = new Date(weekStart);
  d.setDate(weekStart.getDate() + dayIndex);
  return d;
}

/** ISO [from, to] range for the week `weekOffset` weeks from today (0 = current week) */
export function getWeekRange(weekOffset = 0) {
  const today = new Date();
  const day = today.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(today);
  mon.setDate(today.getDate() + diffToMon + weekOffset * 7);
  mon.setHours(0, 0, 0, 0);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  sun.setHours(23, 59, 59, 999);
  return { from: mon.toISOString(), to: sun.toISOString(), weekStart: mon };
}

/* ── Class selection helpers ────────────────────────────────── */

export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/** Returns the ongoing class, or the next upcoming one, from a list of today's classes. */
export function getHighlightClass(classes: ClassItem[]): { current: ClassItem | null; isOngoing: boolean } {
  const now = new Date();
  const sorted = [...classes].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  const ongoing = sorted.find((cls) => now >= cls.startDate && now <= cls.endDate);
  if (ongoing) return { current: ongoing, isOngoing: true };
  const next = sorted.find((cls) => cls.startDate > now);
  return { current: next ?? null, isOngoing: false };
}
