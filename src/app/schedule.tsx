import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Linking from 'expo-linking';

import { ClassCard } from '@/components/class-card';
import { ScreenLayout } from '@/components/screen-layout';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getWeekRange, useWeekEvents } from '@/hooks/use-week-events';
import type { ClassItem } from '@/lib/event-utils';
import { formatTime, handleJoinMeeting } from '@/lib/event-utils';
import { useScheduleStore } from '@/store/schedule-store';

/* ──────────────────────────────────────────────────────────────
   Constants / helpers
   ────────────────────────────────────────────────────────────── */

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
type Day = (typeof DAYS)[number];

const DAY_BY_INDEX: Record<number, Day> = {
  0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat',
};

function getTodayDayIndex(): number {
  const d = new Date().getDay(); // 0=Sun, 1=Mon … 6=Sat
  // DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] → indices 0–6
  // Mon(1)→0, Tue(2)→1, … Sat(6)→5, Sun(0)→6
  return d === 0 ? 6 : d - 1;
}

function isCurrentWeek(weekOffset: number) {
  return weekOffset === 0;
}

/** Given the week start (Monday) + a DAYS index (0=Mon…6=Sun), return that day's Date */
function dateForDayIndex(weekStart: Date, dayIndex: number): Date {
  const d = new Date(weekStart);
  d.setDate(weekStart.getDate() + dayIndex);
  return d;
}

/* ──────────────────────────────────────────────────────────────
   Add-to-Calendar helper
   Uses platform-native calendar URLs — no extra package needed.
   ────────────────────────────────────────────────────────────── */
async function addEventToCalendar(item: ClassItem): Promise<void> {
  /** Format Date → compact UTC string for Google Calendar */
  const fmtGcal = (d: Date) =>
    d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  if (Platform.OS === 'ios') {
    // Apple Calendar deep-link (opens the New Event sheet pre-filled)
    // calshow:// accepts a Unix timestamp (seconds since 2001-01-01)
    const APPLE_EPOCH_OFFSET = 978307200; // seconds between Unix and Apple epoch
    const ts = Math.floor(item.startDate.getTime() / 1000) - APPLE_EPOCH_OFFSET;
    const calUrl = `calshow:${ts}`;
    const canOpen = await Linking.canOpenURL(calUrl);
    if (canOpen) {
      await Linking.openURL(calUrl);
    } else {
      // Fallback: Google Calendar web
      const url =
        `https://calendar.google.com/calendar/render?action=TEMPLATE` +
        `&text=${encodeURIComponent(item.subject)}` +
        `&dates=${fmtGcal(item.startDate)}/${fmtGcal(item.endDate)}` +
        `&details=${encodeURIComponent(item.description ?? '')}` +
        (item.meetLink ? `&location=${encodeURIComponent(item.meetLink)}` : '');
      await Linking.openURL(url);
    }
    return;
  }

  if (Platform.OS === 'android') {
    // Android intent for inserting a calendar event
    const startMs = item.startDate.getTime();
    const endMs = item.endDate.getTime();
    const intentUrl =
      `content://com.android.calendar/time/${startMs}` +
      `?beginTime=${startMs}&endTime=${endMs}` +
      `&title=${encodeURIComponent(item.subject)}` +
      `&description=${encodeURIComponent(item.description ?? '')}` +
      (item.meetLink ? `&eventLocation=${encodeURIComponent(item.meetLink)}` : '');
    const canOpen = await Linking.canOpenURL(intentUrl);
    if (canOpen) {
      await Linking.openURL(intentUrl);
    } else {
      const url =
        `https://calendar.google.com/calendar/render?action=TEMPLATE` +
        `&text=${encodeURIComponent(item.subject)}` +
        `&dates=${fmtGcal(item.startDate)}/${fmtGcal(item.endDate)}` +
        `&details=${encodeURIComponent(item.description ?? '')}` +
        (item.meetLink ? `&location=${encodeURIComponent(item.meetLink)}` : '');
      await Linking.openURL(url);
    }
    return;
  }

  // Web fallback — open Google Calendar in a new tab
  const url =
    `https://calendar.google.com/calendar/render?action=TEMPLATE` +
    `&text=${encodeURIComponent(item.subject)}` +
    `&dates=${fmtGcal(item.startDate)}/${fmtGcal(item.endDate)}` +
    `&details=${encodeURIComponent(item.description ?? '')}` +
    (item.meetLink ? `&location=${encodeURIComponent(item.meetLink)}` : '');
  await Linking.openURL(url);
}

/* ──────────────────────────────────────────────────────────────
   Event Detail Modal
   ────────────────────────────────────────────────────────────── */
type EventModalProps = {
  item: ClassItem | null;
  onClose: () => void;
};

function EventDetailModal({ item, onClose }: EventModalProps) {
  const theme = useTheme();

  if (!item) return null;

  const duration = Math.round(
    (item.endDate.getTime() - item.startDate.getTime()) / 60_000,
  );
  const dateLabel = item.startDate.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <Modal
      visible={!!item}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent>
      {/* Dim overlay */}
      <Pressable style={styles.modalOverlay} onPress={onClose} />

      {/* Sheet */}
      <View style={[styles.modalSheet, { backgroundColor: theme.backgroundElement }]}>
        {/* Drag handle */}
        <View style={[styles.dragHandle, { backgroundColor: theme.textSecondary + '40' }]} />

        {/* Color accent bar */}
        <View style={[styles.accentBar, { backgroundColor: item.color }]} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.modalScroll}>

          {/* Badge */}
          <View style={[styles.badge, { backgroundColor: item.color + '20' }]}>
            <View style={[styles.badgeDot, { backgroundColor: item.color }]} />
            <ThemedText type="smallBold" style={{ color: item.color, fontSize: 11, letterSpacing: 0.8 }}>
              CLASS
            </ThemedText>
          </View>

          {/* Title */}
          <ThemedText type="subtitle" style={styles.modalTitle}>{item.subject}</ThemedText>

          {/* Description */}
          {!!item.description && (
            <ThemedText type="small" themeColor="textSecondary" style={styles.modalDescription}>
              {item.description}
            </ThemedText>
          )}

          {/* Metadata rows */}
          <View style={[styles.metaCard, { backgroundColor: theme.background + 'CC' }]}>
            <View style={styles.metaRow}>
              <ThemedText style={styles.metaIcon}>📅</ThemedText>
              <View style={styles.metaBody}>
                <ThemedText type="small" themeColor="textSecondary">Date</ThemedText>
                <ThemedText type="smallBold">{dateLabel}</ThemedText>
              </View>
            </View>

            <View style={[styles.metaDivider, { backgroundColor: theme.textSecondary + '20' }]} />

            <View style={styles.metaRow}>
              <ThemedText style={styles.metaIcon}>🕐</ThemedText>
              <View style={styles.metaBody}>
                <ThemedText type="small" themeColor="textSecondary">Time</ThemedText>
                <ThemedText type="smallBold">
                  {formatTime(item.startTime)} – {formatTime(item.endTime)}
                </ThemedText>
              </View>
            </View>

            <View style={[styles.metaDivider, { backgroundColor: theme.textSecondary + '20' }]} />

            <View style={styles.metaRow}>
              <ThemedText style={styles.metaIcon}>⏱️</ThemedText>
              <View style={styles.metaBody}>
                <ThemedText type="small" themeColor="textSecondary">Duration</ThemedText>
                <ThemedText type="smallBold">{duration} minutes</ThemedText>
              </View>
            </View>

            {item.meetLink && (
              <>
                <View style={[styles.metaDivider, { backgroundColor: theme.textSecondary + '20' }]} />
                <View style={styles.metaRow}>
                  <ThemedText style={styles.metaIcon}>🔗</ThemedText>
                  <View style={styles.metaBody}>
                    <ThemedText type="small" themeColor="textSecondary">Meeting Link</ThemedText>
                    <ThemedText
                      type="smallBold"
                      style={{ color: item.color }}
                      numberOfLines={1}>
                      {item.meetLink}
                    </ThemedText>
                  </View>
                </View>
              </>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            {item.meetLink && (
              <TouchableOpacity
                style={[styles.joinBtn, { backgroundColor: item.color }]}
                onPress={() => handleJoinMeeting(item.meetLink!)}
                activeOpacity={0.85}>
                <ThemedText style={styles.joinBtnText}>▶  Join Live Class</ThemedText>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.calendarBtn, { borderColor: item.color + '60', backgroundColor: item.color + '12' }]}
              onPress={() => addEventToCalendar(item)}
              activeOpacity={0.8}>
              <ThemedText style={styles.calendarBtnText}>
                🗓️  Add to Calendar
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Close button */}
        <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
          <ThemedText type="smallBold" themeColor="textSecondary">Close</ThemedText>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

/* ──────────────────────────────────────────────────────────────
   Schedule Screen
   ────────────────────────────────────────────────────────────── */
export default function ScheduleScreen() {
  const { selectedDay, setSelectedDay, weekOffset, setWeekOffset } = useScheduleStore();
  const { events, loading, error } = useWeekEvents(weekOffset);
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

  /* Whether today falls in the currently visible week */
  const todayInThisWeek = isCurrentWeek(weekOffset);

  const handleDayPress = useCallback((i: number) => {
    setSelectedDay(i);
  }, [setSelectedDay]);

  return (
    <ScreenLayout>
      {/* ── Header ── */}
      <ThemedView style={styles.header}>
        <ThemedText type="subtitle">Schedule</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">{selectedDateLabel}</ThemedText>
      </ThemedView>

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
        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator />
          </View>
        ) : error ? (
          <ThemedView type="backgroundElement" style={styles.emptyState}>
            <ThemedText type="default" themeColor="textSecondary">
              Could not load schedule
            </ThemedText>
          </ThemedView>
        ) : classes.length === 0 ? (
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

      {/* ── Event detail modal ── */}
      <EventDetailModal
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

  /* ── Modal ── */
  modalOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    overflow: 'hidden',
    maxHeight: '90%',
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  accentBar: { height: 3, marginBottom: Spacing.three },
  modalScroll: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.three, gap: Spacing.three },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeDot: { width: 7, height: 7, borderRadius: 3.5 },
  modalTitle: { lineHeight: 36 },
  modalDescription: { lineHeight: 20 },
  metaCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: 0,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.two },
  metaDivider: { height: 1, marginHorizontal: 0 },
  metaIcon: { fontSize: 18, width: 28, textAlign: 'center' },
  metaBody: { flex: 1, gap: 2 },
  actions: { gap: Spacing.two, marginTop: Spacing.one },
  joinBtn: {
    borderRadius: Spacing.two + 2,
    paddingVertical: Spacing.three - 2,
    alignItems: 'center',
  },
  joinBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  calendarBtn: {
    borderRadius: Spacing.two + 2,
    paddingVertical: Spacing.three - 2,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  calendarBtnText: { fontSize: 15, fontWeight: '600' },
  closeBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
    marginTop: Spacing.one,
  },
});
