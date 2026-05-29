import {useEffect, useState} from 'react';
import {ActivityIndicator, ScrollView, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {ThemedText} from '@/components/themed-text';
import {ThemedView} from '@/components/themed-view';
import {BottomTabInset, MaxContentWidth, Spacing} from '@/constants/theme';
import {type Event as ApiEvent, fetchEvents} from '@/lib/api';

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

const RECENT_NOTIFS = [
  { id: '1', emoji: '⏰', title: 'Class in 15 minutes', message: 'Mathematics with Mr. Sharma — Room 101', color: '#3c87f7' },
  { id: '2', emoji: '🔄', title: 'Room Change – Science', message: 'Wednesday Science moved to Lab 5', color: '#FF9500' },
];

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function getNextClass(classes: ClassItem[]): ClassItem | null {
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  return (
    classes.find((cls) => {
      const [h, m] = cls.startTime.split(':').map(Number);
      return h * 60 + m > current;
    }) ?? null
  );
}

export default function HomeScreen() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    const to = new Date();
    to.setHours(23, 59, 59, 999);

    fetchEvents()
      .then((events) => {
        const sorted = [...events].sort(
          (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
        );
        setClasses(sorted.map(toClassItem));
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const nextClass = getNextClass(classes);
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: BottomTabInset + Spacing.three }]}>

          <ThemedView style={styles.header}>
            <ThemedText type="small" themeColor="textSecondary">{today}</ThemedText>
            <ThemedText type="subtitle">{getGreeting()}</ThemedText>
          </ThemedView>

          {loading ? (
            <ThemedView type="backgroundElement" style={styles.loadingCard}>
              <ActivityIndicator />
            </ThemedView>
          ) : error ? (
            <ThemedView type="backgroundElement" style={styles.noClassCard}>
              <ThemedText type="default" themeColor="textSecondary">Could not load schedule</ThemedText>
            </ThemedView>
          ) : nextClass ? (
            <ThemedView type="backgroundElement" style={styles.nextCard}>
              <View style={styles.nextCardHeader}>
                <ThemedText type="small" themeColor="textSecondary">NEXT CLASS</ThemedText>
                <View style={styles.liveDot} />
              </View>
              <View style={[styles.nextCardAccent, { backgroundColor: nextClass.color }]} />
              <ThemedText type="subtitle" style={styles.nextSubject}>{nextClass.subject}</ThemedText>
              {!!nextClass.description && (
                <ThemedText type="small" themeColor="textSecondary">{nextClass.description}</ThemedText>
              )}
              <View style={[styles.nextTimePill, { backgroundColor: nextClass.color + '20' }]}>
                <ThemedText type="smallBold" style={{ color: nextClass.color }}>
                  {formatTime(nextClass.startTime)} – {formatTime(nextClass.endTime)}
                </ThemedText>
              </View>
            </ThemedView>
          ) : (
            <ThemedView type="backgroundElement" style={styles.noClassCard}>
              <ThemedText type="default" themeColor="textSecondary">No more classes today</ThemedText>
            </ThemedView>
          )}

          <ThemedText type="smallBold" style={styles.sectionTitle}>Today's Classes</ThemedText>

          {loading ? (
            <View style={styles.loadingInline}>
              <ActivityIndicator />
            </View>
          ) : error ? (
            <ThemedView type="backgroundElement" style={styles.noClassCard}>
              <ThemedText type="small" themeColor="textSecondary">{error}</ThemedText>
            </ThemedView>
          ) : classes.length === 0 ? (
            <ThemedView type="backgroundElement" style={styles.noClassCard}>
              <ThemedText type="default" themeColor="textSecondary">No classes scheduled for today</ThemedText>
            </ThemedView>
          ) : (
            <View style={styles.timeline}>
              {classes.map((cls, i) => (
                <View key={cls.id} style={styles.timelineRow}>
                  <View style={styles.timelineLeft}>
                    <View style={[styles.timelineDot, { backgroundColor: cls.color }]} />
                    {i < classes.length - 1 && <View style={styles.timelineLine} />}
                  </View>
                  <ThemedView type="backgroundElement" style={styles.timelineCard}>
                    <ThemedText type="smallBold">{cls.subject}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {formatTime(cls.startTime)} – {formatTime(cls.endTime)}
                      {cls.description ? `  ·  ${cls.description}` : ''}
                    </ThemedText>
                  </ThemedView>
                </View>
              ))}
            </View>
          )}

          <ThemedText type="smallBold" style={styles.sectionTitle}>Recent Notifications</ThemedText>
          <View style={styles.notifList}>
            {RECENT_NOTIFS.map((n) => (
              <ThemedView key={n.id} type="backgroundElement" style={styles.notifRow}>
                <View style={[styles.notifIcon, { backgroundColor: n.color + '20' }]}>
                  <ThemedText style={styles.notifEmoji}>{n.emoji}</ThemedText>
                </View>
                <View style={styles.notifText}>
                  <ThemedText type="smallBold">{n.title}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">{n.message}</ThemedText>
                </View>
              </ThemedView>
            ))}
          </View>

        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', justifyContent: 'center' },
  safeArea: { flex: 1, maxWidth: MaxContentWidth },
  scrollContent: { padding: Spacing.three, gap: Spacing.three },
  header: { gap: Spacing.half, paddingBottom: Spacing.one },
  loadingCard: { borderRadius: Spacing.four, padding: Spacing.four, alignItems: 'center' },
  loadingInline: { padding: Spacing.three, alignItems: 'center' },
  nextCard: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.two,
    overflow: 'hidden',
  },
  nextCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#34C759' },
  nextCardAccent: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.08,
  },
  nextSubject: { lineHeight: 38 },
  nextTimePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
    marginTop: Spacing.one,
  },
  noClassCard: { borderRadius: Spacing.four, padding: Spacing.four, alignItems: 'center' },
  sectionTitle: { marginTop: Spacing.one },
  timeline: { gap: 0 },
  timelineRow: { flexDirection: 'row', gap: Spacing.two },
  timelineLeft: { alignItems: 'center', paddingTop: Spacing.three + 3 },
  timelineDot: { width: 10, height: 10, borderRadius: 5 },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#00000018', marginVertical: Spacing.half },
  timelineCard: {
    flex: 1,
    borderRadius: Spacing.two,
    padding: Spacing.three,
    marginBottom: Spacing.two,
    gap: Spacing.half,
  },
  notifList: { gap: Spacing.two },
  notifRow: {
    flexDirection: 'row',
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.three,
    alignItems: 'center',
  },
  notifIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  notifEmoji: { fontSize: 18 },
  notifText: { flex: 1, gap: Spacing.half },
});
