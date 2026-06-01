import {useMemo} from 'react';
import {ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {useRouter} from 'expo-router';

import {ScreenLayout} from '@/components/screen-layout';
import {ThemedText} from '@/components/themed-text';
import {ThemedView} from '@/components/themed-view';
import {BottomTabInset, Spacing} from '@/constants/theme';
import {useWeekEvents} from '@/hooks/use-week-events';
import {useNotificationsStore} from '@/store/notifications-store';
import {type ClassItem, formatTime, handleJoinMeeting} from '@/lib/event-utils';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function getHighlightClass(classes: ClassItem[]) {
  const now = new Date();
  const sorted = [...classes].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  const ongoing = sorted.find((cls) => now >= cls.startDate && now <= cls.endDate);
  if (ongoing) return { current: ongoing, isOngoing: true };
  const next = sorted.find((cls) => cls.startDate > now);
  return { current: next ?? null, isOngoing: false };
}

type UpcomingRowProps = { item: ClassItem; onPress: () => void };

function UpcomingRow({ item, onPress }: UpcomingRowProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
      <ThemedView type="backgroundElement" style={styles.upcomingRow}>
        <View style={[styles.upcomingDot, { backgroundColor: item.color }]} />
        <View style={styles.upcomingBody}>
          <ThemedText type="smallBold" numberOfLines={1}>{item.subject}</ThemedText>
          {!!item.description && (
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>{item.description}</ThemedText>
          )}
        </View>
        <View style={[styles.timePill, { backgroundColor: item.color + '20' }]}>
          <ThemedText type="smallBold" style={{ color: item.color, fontSize: 12 }}>
            {formatTime(item.startTime)}
          </ThemedText>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { events: allEvents, loading, error } = useWeekEvents();
  const router = useRouter();
  const unreadCount = useNotificationsStore((s) => s.notifs.filter((n) => !n.read).length);

  const todayClasses = useMemo(
    () => allEvents.filter((cls) => isToday(cls.startDate)),
    [allEvents],
  );

  const { current: highlightClass, isOngoing } = useMemo(
    () => getHighlightClass(todayClasses),
    [todayClasses],
  );

  const upcomingClasses = useMemo(() => {
    const now = new Date();
    return todayClasses
      .filter((cls) => cls !== highlightClass && cls.startDate > now)
      .slice(0, 5);
  }, [todayClasses, highlightClass]);

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <ScreenLayout>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: BottomTabInset + Spacing.three }]}>

        {/* Header */}
        <ThemedView style={styles.header}>
          <View>
            <ThemedText type="small" themeColor="textSecondary">{today}</ThemedText>
            <ThemedText type="subtitle">{getGreeting()}</ThemedText>
          </View>
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => router.push('/notifications')}
            activeOpacity={0.7}>
            <ThemedText style={styles.bellEmoji}>🔔</ThemedText>
            {unreadCount > 0 && (
              <View style={styles.bellBadge}>
                <ThemedText style={styles.bellBadgeText}>{unreadCount}</ThemedText>
              </View>
            )}
          </TouchableOpacity>
        </ThemedView>

        {/* Next / Ongoing Class */}
        <ThemedText type="smallBold" style={styles.sectionTitle}>
          {isOngoing ? 'LIVE NOW' : 'NEXT CLASS'}
        </ThemedText>

        {loading ? (
          <ThemedView type="backgroundElement" style={styles.loadingCard}>
            <ActivityIndicator />
          </ThemedView>
        ) : error ? (
          <ThemedView type="backgroundElement" style={styles.emptyCard}>
            <ThemedText type="default" themeColor="textSecondary">Could not load schedule</ThemedText>
          </ThemedView>
        ) : !highlightClass ? (
          <ThemedView type="backgroundElement" style={styles.emptyCard}>
            <ThemedText type="default" themeColor="textSecondary">No more classes today</ThemedText>
          </ThemedView>
        ) : (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push(`/class/${highlightClass.id}`)}>
            <ThemedView
              type="backgroundElement"
              style={styles.heroCard}>
              <View style={styles.heroBadgeRow}>
                <View style={[styles.liveBadge, { backgroundColor: (isOngoing ? '#FF3B30' : highlightClass.color) + '20' }]}>
                  <View style={[styles.liveDot, { backgroundColor: isOngoing ? '#FF3B30' : highlightClass.color }]} />
                  <ThemedText
                    type="smallBold"
                    style={{ color: isOngoing ? '#FF3B30' : highlightClass.color, fontSize: 11, letterSpacing: 0.8 }}>
                    {isOngoing ? 'LIVE' : 'UPCOMING'}
                  </ThemedText>
                </View>
              </View>
              <ThemedText type="subtitle" style={styles.heroTitle}>{highlightClass.subject}</ThemedText>
              {!!highlightClass.description && (
                <ThemedText type="small" themeColor="textSecondary">{highlightClass.description}</ThemedText>
              )}
              <View style={styles.heroMeta}>
                <View style={[styles.timePill, { backgroundColor: highlightClass.color + '20' }]}>
                  <ThemedText type="smallBold" style={{ color: highlightClass.color, fontSize: 13 }}>
                    {formatTime(highlightClass.startTime)} – {formatTime(highlightClass.endTime)}
                  </ThemedText>
                </View>
                {highlightClass.meetLink && (
                  <TouchableOpacity
                    style={[styles.joinBtn, { backgroundColor: '#FF3B30' }]}
                    onPress={(e) => {
                      e.stopPropagation?.();
                      handleJoinMeeting(highlightClass.meetLink!);
                    }}
                    activeOpacity={0.85}>
                    <ThemedText style={styles.joinBtnText}>▶  Join Live</ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            </ThemedView>
          </TouchableOpacity>
        )}

        {/* Today's Upcoming */}
        {!loading && !error && upcomingClasses.length > 0 && (
          <>
            <ThemedText type="smallBold" style={styles.sectionTitle}>TODAY'S UPCOMING</ThemedText>
            <View style={styles.upcomingList}>
              {upcomingClasses.map((cls) => (
                <UpcomingRow
                  key={cls.id}
                  item={cls}
                  onPress={() => router.push(`/class/${cls.id}`)}
                />
              ))}
            </View>
          </>
        )}

      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: Spacing.three, gap: Spacing.three },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: Spacing.one },
  bellBtn: { position: 'relative', padding: Spacing.one },
  bellEmoji: { fontSize: 22 },
  bellBadge: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: '#FF3B30', borderRadius: 8,
    minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  bellBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  sectionTitle: { fontSize: 12, letterSpacing: 0.8, opacity: 0.7, textTransform: 'uppercase' },
  loadingCard: { borderRadius: Spacing.four, padding: Spacing.four, alignItems: 'center' },
  emptyCard: { borderRadius: Spacing.four, padding: Spacing.four, alignItems: 'center' },
  heroCard: { borderRadius: Spacing.four, padding: Spacing.four, gap: Spacing.three },
  heroBadgeRow: { flexDirection: 'row' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  liveDot: { width: 7, height: 7, borderRadius: 3.5 },
  heroTitle: { lineHeight: 38 },
  heroMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.one },
  timePill: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.one, borderRadius: Spacing.two },
  joinBtn: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two - 2, borderRadius: Spacing.two, alignItems: 'center' },
  joinBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  upcomingList: { gap: Spacing.two },
  upcomingRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.three, borderRadius: Spacing.three, gap: Spacing.three },
  upcomingDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  upcomingBody: { flex: 1, gap: Spacing.half },
});
