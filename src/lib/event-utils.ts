import { Linking } from 'react-native';
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
