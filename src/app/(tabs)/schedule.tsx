import {useCallback, useMemo, useState} from 'react';
import {ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View,} from 'react-native';

import { ClassCard } from '@/components/class-card';
import { EventDrawer } from '@/components/event-drawer';
import { ScreenLayout } from '@/components/screen-layout';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useProfile } from '@/hooks/use-profile';
import { useWeekEvents } from '@/hooks/use-week-events';
import {
  DAYS, DAY_BY_INDEX,
  dateForDayIndex, getTodayDayIndex, getWeekRange,
  type ClassItem, type Day,
} from '@/lib/event-utils';
import { useScheduleStore } from '@/store/schedule-store';


export default function ScheduleScreen() {
  const { selectedDay, setSelectedDay, weekOffset, setWeekOffset } = useScheduleStore();
  const { student, loading: profileLoading, error: profileError } = useProfile();
  const batchId = student?.batchId;
  const { events, loading: eventsLoading, error: eventsError } = useWeekEvents(weekOffset, batchId);

  const loading = profileLoading || (!!batchId && eventsLoading);
  const error = profileError || eventsError;

  const theme = useTheme();
  const todayDayIndex = getTodayDayIndex();

  const [selectedEvent, setSelectedEvent] = useState<ClassItem | null>(null);

  /* Compute the week's Monday date */
  const { weekStart } = getWeekRange(weekOffset);

  /* Date label for the selected day */
  const selectedDate = dateForDayIndex(weekStart, selectedDay);
  const selectedDateLabel = selectedDate.toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  /* Week label in the navigation bar */
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const weekLabel = (() => {
    const fmt = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    if (weekOffset === 0) return 'This Week';
    if (weekOffset === -1) return 'Last Week';
    if (weekOffset === 1) return 'Next Week';
    return `${fmt(weekStart)} – ${fmt(weekEnd)}`;
  })();

  /* Group events by weekday */
  const schedule = useMemo(() => {
    const grouped: Partial<Record<Day, ClassItem[]>> = {};
    for (const event of events) {
      const dayName = DAY_BY_INDEX[event.startDate.getDay()];
      if (!dayName) continue;
      if (!grouped[dayName]) grouped[dayName] = [];
      grouped[dayName]!.push(event);
    }
    return grouped;
  }, [events]);

  const classes = schedule[DAYS[selectedDay]] ?? [];

  const todayInThisWeek = weekOffset === 0;

  const handleDayPress = useCallback((i: number) => {
    setSelectedDay(i);
  }, [setSelectedDay]);

  return (
    <ScreenLayout>
      {/* ── Header ── */}
      <ThemedView style={styles.header}>
        <ThemedText type="subtitle">Schedule</ThemedText>
        {!loading && !error && batchId && (
          <ThemedText type="small" themeColor="textSecondary">{selectedDateLabel}</ThemedText>
        )}
      </ThemedView>

      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator />
        </View>
      ) : error ? (
        <View style={styles.contentPadding}>
          <ThemedView type="backgroundElement" style={styles.emptyState}>
            <ThemedText type="default" themeColor="textSecondary">
              Could not load schedule
            </ThemedText>
          </ThemedView>
        </View>
      ) : !batchId ? (
        <View style={styles.contentPadding}>
          <ThemedView type="backgroundElement" style={styles.noBatchCard}>
            <ThemedText style={styles.noBatchEmoji}>🎒</ThemedText>
            <ThemedText type="smallBold" style={styles.noBatchTitle}>No Batch Assigned</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.noBatchDesc}>
              You are not currently enrolled in any batch. Please contact your administrator to view your schedule.
            </ThemedText>
          </ThemedView>
        </View>
      ) : (
        <>
          {/* ── Week navigation ── */}
          <View style={styles.weekNav}>
            <TouchableOpacity
              onPress={() => setWeekOffset(weekOffset - 1)}
              style={[styles.weekNavBtn, { backgroundColor: theme.backgroundElement }]}
              activeOpacity={0.7}>
              <ThemedText style={styles.weekNavArrow}>‹</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { setWeekOffset(0); setSelectedDay(getTodayDayIndex()); }}
              activeOpacity={0.8}>
              <ThemedText type="smallBold" style={styles.weekLabel}>{weekLabel}</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setWeekOffset(weekOffset + 1)}
              style={[styles.weekNavBtn, { backgroundColor: theme.backgroundElement }]}
              activeOpacity={0.7}>
              <ThemedText style={styles.weekNavArrow}>›</ThemedText>
            </TouchableOpacity>
          </View>

          {/* ── Day picker ── */}
          <ThemedView type="backgroundElement" style={styles.dayPicker}>
            {DAYS.map((day, i) => {
              const isSelected = selectedDay === i;
              const isToday = todayInThisWeek && todayDayIndex === i;
              const dayDate = dateForDayIndex(weekStart, i);
              const dayNumber = dayDate.getDate();

              return (
                <TouchableOpacity
                  key={day}
                  onPress={() => handleDayPress(i)}
                  style={[styles.dayBtn, isSelected && { backgroundColor: theme.text }]}
                  activeOpacity={0.7}>
                  <ThemedText
                    type="smallBold"
                    style={[
                      styles.dayBtnLabel,
                      isSelected ? { color: theme.background } : undefined,
                    ]}
                    themeColor={isSelected ? undefined : 'textSecondary'}>
                    {isToday ? 'Today' : day}
                  </ThemedText>
                  <ThemedText
                    type="small"
                    style={[
                      styles.dayNumber,
                      { color: isSelected ? theme.background : theme.textSecondary },
                    ]}>
                    {dayNumber}
                  </ThemedText>
                  {isToday && (
                    <View
                      style={[
                        styles.todayDot,
                        { backgroundColor: isSelected ? theme.background : '#3c87f7' },
                      ]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ThemedView>

          {/* ── Classes list ── */}
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: BottomTabInset + Spacing.three },
            ]}
            showsVerticalScrollIndicator={false}>
            {classes.length === 0 ? (
              <ThemedView type="backgroundElement" style={styles.emptyState}>
                <ThemedText type="default" themeColor="textSecondary">
                  No classes scheduled
                </ThemedText>
              </ThemedView>
            ) : (
              classes.map((cls) => (
                <ClassCard
                  key={cls.id}
                  item={cls}
                  onPress={() => setSelectedEvent(cls)}
                />
              ))
            )}
          </ScrollView>
        </>
      )}

      {/* ── Event detail drawer ── */}
      <EventDrawer
        item={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </ScreenLayout>
  );
}

/* ──────────────────────────────────────────────────────────────
   Styles
   ────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  /* Header */
  header: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.two,
    gap: Spacing.half,
  },

  /* Week navigation */
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.two,
  },
  weekNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekNavArrow: { fontSize: 22, lineHeight: 24, marginTop: -2 },
  weekLabel: { fontSize: 14 },

  /* Day picker */
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
    gap: 2,
  },
  dayBtnLabel: { fontSize: 11 },
  dayNumber: { fontSize: 13, fontWeight: '700' },
  todayDot: { width: 4, height: 4, borderRadius: 2 },

  /* List */
  scroll: { flex: 1 },
  loadingState: { padding: Spacing.four, alignItems: 'center' },
  scrollContent: { paddingHorizontal: Spacing.three, gap: Spacing.two },
  emptyState: {
    borderRadius: Spacing.three,
    padding: Spacing.four,
    alignItems: 'center',
  },
  contentPadding: {
    paddingHorizontal: Spacing.three,
  },
  noBatchCard: {
    borderRadius: Spacing.four,
    padding: Spacing.six,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    marginTop: Spacing.four,
    borderWidth: 1,
    borderColor: '#88888820',
  },
  noBatchEmoji: {
    fontSize: 48,
    marginBottom: Spacing.one,
  },
  noBatchTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  noBatchDesc: {
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.two,
  },
});
