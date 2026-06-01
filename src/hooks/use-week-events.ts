import { useQuery } from '@tanstack/react-query';
import { fetchEvents } from '@/lib/api';
import { toClassItem, type ClassItem } from '@/lib/event-utils';

/** Returns the ISO range [from, to] for the week that is `weekOffset` weeks away from today.
 *  weekOffset=0  → current week (Mon–Sun)
 *  weekOffset=-1 → last week
 *  weekOffset=1  → next week
 */
export function getWeekRange(weekOffset = 0) {
  const today = new Date();
  const day = today.getDay();
  // Number of days from today back to the Monday of the same week.
  // Sun(0) → -6 days, Mon(1) → 0, Tue(2) → -1, … Sat(6) → -5
  const diffToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(today);
  mon.setDate(today.getDate() + diffToMon + weekOffset * 7);
  mon.setHours(0, 0, 0, 0);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  sun.setHours(23, 59, 59, 999);
  return { from: mon.toISOString(), to: sun.toISOString(), weekStart: mon };
}

function toSortedClassItems(raw: Awaited<ReturnType<typeof fetchEvents>>): ClassItem[] {
  return [...raw]
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .map(toClassItem);
}

export function useWeekEvents(weekOffset = 0) {
  const { from, to } = getWeekRange(weekOffset);
  const { data = [], isLoading, error } = useQuery({
    queryKey: ['events', 'week', from, to],
    queryFn: () => fetchEvents({ from, to }).then(toSortedClassItems),
  });
  return { events: data, loading: isLoading, error: error ? (error as Error).message : null };
}
