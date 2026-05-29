import {useEffect, useState} from 'react';
import {ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View, Linking} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';

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
  startDate: Date;
  endDate: Date;
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
    startDate: start,
    endDate: end,
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

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
type Weekday = (typeof WEEKDAYS)[number];
const WEEKDAY_BY_INDEX: Record<number, Weekday> = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  0: 'Sunday',
};

function getOngoingAndNextClass(classes: ClassItem[]) {
  const now = new Date();
  
  // Sort classes by start time to make sure they are in chronological order
  const sorted = [...classes].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  
  const ongoing = sorted.find((cls) => now >= cls.startDate && now <= cls.endDate);
  if (ongoing) {
    return { current: ongoing, isOngoing: true };
  }
  
  const next = sorted.find((cls) => cls.startDate > now);
  return { current: next ?? null, isOngoing: false };
}

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

export default function HomeScreen() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { from, to } = getWeekRange();

    fetchEvents({ from, to })
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

  const { current: highlightClass, isOngoing } = getOngoingAndNextClass(classes);
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Group classes by weekday
  const groupedClasses: Partial<Record<Weekday, ClassItem[]>> = {};
  for (const cls of classes) {
    const dayName = WEEKDAY_BY_INDEX[cls.startDate.getDay()];
    if (dayName) {
      if (!groupedClasses[dayName]) {
        groupedClasses[dayName] = [];
      }
      groupedClasses[dayName]!.push(cls);
    }
  }

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
          ) : highlightClass ? (
            <ThemedView type="backgroundElement" style={styles.highlightCard}>
              <View style={styles.highlightCardHeader}>
                <View style={styles.headerLabelContainer}>
                  <ThemedText type="smallBold" style={{ color: isOngoing ? '#FF3B30' : '#3c87f7' }}>
                    {isOngoing ? 'LIVE NOW' : 'NEXT CLASS'}
                  </ThemedText>
                  <View style={[styles.liveDot, { backgroundColor: isOngoing ? '#FF3B30' : '#3c87f7' }]} />
                </View>
              </View>
              <View style={[styles.highlightCardAccent, { backgroundColor: highlightClass.color }]} />
              <ThemedText type="subtitle" style={styles.highlightSubject}>{highlightClass.subject}</ThemedText>
              {!!highlightClass.description && (
                <ThemedText type="small" themeColor="textSecondary">{highlightClass.description}</ThemedText>
              )}
              <View style={styles.highlightMetaRow}>
                <View style={[styles.highlightTimePill, { backgroundColor: highlightClass.color + '20' }]}>
                  <ThemedText type="smallBold" style={{ color: highlightClass.color }}>
                    {formatTime(highlightClass.startTime)} – {formatTime(highlightClass.endTime)}
                  </ThemedText>
                </View>
                {highlightClass.meetLink && (
                  <TouchableOpacity
                    style={[styles.joinBtn, { backgroundColor: '#3c87f7' }]}
                    onPress={() => handleJoinMeeting(highlightClass.meetLink!)}
                    activeOpacity={0.8}>
                    <ThemedText type="smallBold" style={styles.joinBtnText}>Join Meeting</ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            </ThemedView>
          ) : (
            <ThemedView type="backgroundElement" style={styles.noClassCard}>
              <ThemedText type="default" themeColor="textSecondary">No upcoming classes scheduled</ThemedText>
            </ThemedView>
          )}

          <ThemedText type="smallBold" style={styles.sectionTitle}>Weekly Schedule</ThemedText>

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
              <ThemedText type="default" themeColor="textSecondary">No classes scheduled for this week</ThemedText>
            </ThemedView>
          ) : (
            <View style={styles.scheduleList}>
              {WEEKDAYS.map((day) => {
                const dayClasses = groupedClasses[day] ?? [];
                
                // Show weekend days (Sat/Sun) only if they have classes
                const isWeekend = day === 'Saturday' || day === 'Sunday';
                if (isWeekend && dayClasses.length === 0) return null;
                
                return (
                  <View key={day} style={styles.daySection}>
                    <ThemedText type="smallBold" style={styles.dayHeader}>
                      {day}
                    </ThemedText>
                    {dayClasses.length === 0 ? (
                      <ThemedView type="backgroundElement" style={styles.emptyDayCard}>
                        <ThemedText type="small" themeColor="textSecondary">
                          No classes scheduled
                        </ThemedText>
                      </ThemedView>
                    ) : (
                      <View style={styles.dayClasses}>
                        {dayClasses.map((cls) => (
                          <ThemedView key={cls.id} type="backgroundElement" style={styles.classCard}>
                            <View style={[styles.classColorBar, { backgroundColor: cls.color }]} />
                            <View style={styles.classCardBody}>
                              <View style={styles.classCardHeader}>
                                <ThemedText type="smallBold" style={styles.classSubject}>
                                  {cls.subject}
                                </ThemedText>
                                <View style={[styles.classTimePill, { backgroundColor: cls.color + '15' }]}>
                                  <ThemedText type="small" style={{ color: cls.color, fontWeight: '600', fontSize: 12 }}>
                                    {formatTime(cls.startTime)}
                                  </ThemedText>
                                </View>
                              </View>
                              {!!cls.description && (
                                <ThemedText type="small" themeColor="textSecondary">
                                  {cls.description}
                                </ThemedText>
                              )}
                              <View style={styles.classCardMeta}>
                                <ThemedText type="small" themeColor="textSecondary">
                                  {formatTime(cls.startTime)} – {formatTime(cls.endTime)}
                                </ThemedText>
                                {cls.meetLink && (
                                  <TouchableOpacity
                                    style={[styles.classJoinBtn, { backgroundColor: '#3c87f7' }]}
                                    onPress={() => handleJoinMeeting(cls.meetLink!)}
                                    activeOpacity={0.8}>
                                    <ThemedText type="smallBold" style={styles.classJoinBtnText}>
                                      Join Meeting
                                    </ThemedText>
                                  </TouchableOpacity>
                                )}
                              </View>
                            </View>
                          </ThemedView>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
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
  highlightCard: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.two,
    overflow: 'hidden',
  },
  highlightCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLabelContainer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  highlightCardAccent: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.08,
  },
  highlightSubject: { lineHeight: 38 },
  highlightMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.one,
  },
  highlightTimePill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
  },
  joinBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
    borderRadius: Spacing.two,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  noClassCard: { borderRadius: Spacing.four, padding: Spacing.four, alignItems: 'center' },
  sectionTitle: { marginTop: Spacing.one },
  scheduleList: { gap: Spacing.one },
  daySection: {
    marginBottom: Spacing.two,
    gap: Spacing.two,
  },
  dayHeader: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: Spacing.two,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.8,
  },
  emptyDayCard: {
    borderRadius: Spacing.two,
    padding: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayClasses: {
    gap: Spacing.two,
  },
  classCard: {
    flexDirection: 'row',
    borderRadius: Spacing.three,
    overflow: 'hidden',
  },
  classColorBar: {
    width: 4,
  },
  classCardBody: {
    flex: 1,
    padding: Spacing.three,
    gap: Spacing.half,
  },
  classCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  classSubject: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.two,
  },
  classTimePill: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Spacing.two,
  },
  classCardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  classJoinBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  classJoinBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
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
