import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { fetchEvents, type Event as ApiEvent } from '@/lib/api';

const handleJoinMeeting = async (url: string) => {
  try {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      await WebBrowser.openBrowserAsync(url);
    } else {
      await Linking.openURL(url);
    }
  } catch (error) {
    console.error('Failed to open meeting link:', error);
  }
};

type ClassItem = {
  id: string;
  subject: string;
  description: string;
  meetLink: string | null;
  startTime: string;
  endTime: string;
  color: string;
};

const EVENT_COLORS = ['#3c87f7', '#AF52DE', '#34C759', '#FF9500', '#FF3B30', '#FF2D55'];

function colorForTitle(title: string): string {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = title.charCodeAt(i) + ((h << 5) - h);
  return EVENT_COLORS[Math.abs(h) % EVENT_COLORS.length];
}

function toClassItem(event: ApiEvent): ClassItem {
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
  };
}

function getWeekRange() {
  const today = new Date();
  const day = today.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(today);
  mon.setDate(today.getDate() + diffToMon);
  mon.setHours(0, 0, 0, 0);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  sun.setHours(23, 59, 59, 999);
  return { from: mon.toISOString(), to: sun.toISOString() };
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;
type Day = (typeof DAYS)[number];
const DAY_BY_INDEX: Record<number, Day> = { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri' };

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

function getTodayIndex() {
  const d = new Date().getDay();
  return d === 0 || d === 6 ? 0 : d - 1;
}

export default function ScheduleScreen() {
  const [schedule, setSchedule] = useState<Partial<Record<Day, ClassItem[]>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(getTodayIndex());
  const theme = useTheme();
  const todayIndex = getTodayIndex();

  useEffect(() => {
    const { from, to } = getWeekRange();
    fetchEvents({ from, to })
      .then((events) => {
        const grouped: Partial<Record<Day, ClassItem[]>> = {};
        for (const event of events) {
          const dayName = DAY_BY_INDEX[new Date(event.scheduledAt).getDay()];
          if (!dayName) continue;
          if (!grouped[dayName]) grouped[dayName] = [];
          grouped[dayName]!.push(toClassItem(event));
        }
        for (const day of Object.keys(grouped) as Day[]) {
          grouped[day]!.sort((a, b) => a.startTime.localeCompare(b.startTime));
        }
        setSchedule(grouped);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const classes = schedule[DAYS[selectedDay]] ?? [];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.header}>
          <ThemedText type="subtitle">Schedule</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.dayPicker}>
          {DAYS.map((day, i) => {
            const isSelected = selectedDay === i;
            const isToday = todayIndex === i;
            return (
              <TouchableOpacity
                key={day}
                onPress={() => setSelectedDay(i)}
                style={[styles.dayBtn, isSelected && { backgroundColor: theme.text }]}
                activeOpacity={0.7}>
                <ThemedText
                  type="smallBold"
                  style={isSelected ? { color: theme.background } : undefined}
                  themeColor={isSelected ? undefined : 'textSecondary'}>
                  {day}
                </ThemedText>
                {isToday && (
                  <View style={[styles.todayDot, { backgroundColor: isSelected ? theme.background : '#3c87f7' }]} />
                )}
              </TouchableOpacity>
            );
          })}
        </ThemedView>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: BottomTabInset + Spacing.three }]}
          showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator />
            </View>
          ) : error ? (
            <ThemedView type="backgroundElement" style={styles.emptyState}>
              <ThemedText type="default" themeColor="textSecondary">Could not load schedule</ThemedText>
            </ThemedView>
          ) : classes.length === 0 ? (
            <ThemedView type="backgroundElement" style={styles.emptyState}>
              <ThemedText type="default" themeColor="textSecondary">No classes scheduled</ThemedText>
            </ThemedView>
          ) : (
            classes.map((cls) => (
              <ThemedView key={cls.id} type="backgroundElement" style={styles.card}>
                <View style={[styles.colorBar, { backgroundColor: cls.color }]} />
                <View style={styles.cardBody}>
                  <View style={styles.cardTop}>
                    <ThemedText type="smallBold" style={styles.subjectText}>{cls.subject}</ThemedText>
                    <View style={[styles.timePill, { backgroundColor: cls.color + '20' }]}>
                      <ThemedText type="small" style={[styles.timeText, { color: cls.color }]}>
                        {formatTime(cls.startTime)}
                      </ThemedText>
                    </View>
                  </View>
                  {!!cls.description && (
                    <ThemedText type="small" themeColor="textSecondary">{cls.description}</ThemedText>
                  )}
                  <View style={styles.cardMeta}>
                    <ThemedText type="small" themeColor="textSecondary">
                      {formatTime(cls.startTime)} – {formatTime(cls.endTime)}
                    </ThemedText>
                    {cls.meetLink && (
                      <TouchableOpacity
                        style={[styles.joinBtn, { backgroundColor: '#3c87f7' }]}
                        onPress={() => handleJoinMeeting(cls.meetLink!)}
                        activeOpacity={0.8}>
                        <ThemedText type="smallBold" style={styles.joinBtnText}>
                          Join Meeting
                        </ThemedText>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </ThemedView>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', justifyContent: 'center' },
  safeArea: { flex: 1, maxWidth: MaxContentWidth },
  header: { paddingHorizontal: Spacing.three, paddingTop: Spacing.four, paddingBottom: Spacing.two, gap: Spacing.half },
  dayPicker: {
    flexDirection: 'row',
    marginHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    padding: Spacing.one,
    gap: Spacing.one,
    marginBottom: Spacing.three,
  },
  dayBtn: {
    flex: 1,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    borderRadius: Spacing.two,
    gap: Spacing.half,
  },
  todayDot: { width: 4, height: 4, borderRadius: 2 },
  scroll: { flex: 1 },
  loadingState: { padding: Spacing.four, alignItems: 'center' },
  scrollContent: { paddingHorizontal: Spacing.three, gap: Spacing.two },
  emptyState: { borderRadius: Spacing.three, padding: Spacing.four, alignItems: 'center' },
  card: {
    flexDirection: 'row',
    borderRadius: Spacing.three,
    overflow: 'hidden',
    minHeight: 90,
  },
  colorBar: { width: 4 },
  cardBody: { flex: 1, padding: Spacing.three, gap: Spacing.half },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  subjectText: { flex: 1, marginRight: Spacing.two },
  timePill: { paddingHorizontal: Spacing.two, paddingVertical: 3, borderRadius: Spacing.two },
  timeText: { fontSize: 12, fontWeight: '600' },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.one },
  joinBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});
