import { Modal, Platform, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { addEventToCalendar, formatTime, handleJoinMeeting, type ClassItem } from '@/lib/event-utils';

type Props = {
  item: ClassItem | null;
  onClose: () => void;
};

export function EventDrawer({ item, onClose }: Props) {
  const theme = useTheme();

  return (
    <Modal
      visible={!!item}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent>
      <Pressable style={styles.overlay} onPress={onClose} />

      <View style={[styles.sheet, { backgroundColor: theme.backgroundElement }]}>
        <View style={[styles.handle, { backgroundColor: theme.textSecondary + '50' }]} />

        {item && <Content item={item} onClose={onClose} />}
      </View>
    </Modal>
  );
}

function Content({ item, onClose }: { item: ClassItem; onClose: () => void }) {
  const theme = useTheme();

  const duration = Math.round(
    (item.endDate.getTime() - item.startDate.getTime()) / 60_000,
  );
  const dateLabel = item.startDate.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const timeLabel = `${formatTime(item.startTime)} – ${formatTime(item.endTime)}`;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === 'ios' ? 40 : 28 }]}>

      {/* ── Subject + date ── */}
      <View style={styles.titleRow}>
        <View style={[styles.colorDot, { backgroundColor: item.color }]} />
        <View style={styles.titleStack}>
          <ThemedText style={styles.subject} numberOfLines={2}>{item.subject}</ThemedText>
          <ThemedText style={[styles.dateText, { color: theme.textSecondary }]}>{dateLabel}</ThemedText>
        </View>
      </View>

      {/* ── Time + duration chips ── */}
      <View style={styles.chipRow}>
        <View style={[styles.chip, { backgroundColor: item.color + '18' }]}>
          <ThemedText style={[styles.chipText, { color: item.color }]}>{timeLabel}</ThemedText>
        </View>
        <View style={[styles.chip, { backgroundColor: theme.background }]}>
          <ThemedText style={[styles.chipText, { color: theme.textSecondary }]}>{duration} min</ThemedText>
        </View>
      </View>

      {/* ── Description ── */}
      {!!item.description && (
        <ThemedText style={[styles.description, { color: theme.textSecondary }]}>
          {item.description}
        </ThemedText>
      )}

      {/* ── Meet link ── */}
      {item.meetLink && (
        <TouchableOpacity
          style={[styles.linkRow, { backgroundColor: theme.background, borderColor: theme.textSecondary + '25' }]}
          onPress={() => handleJoinMeeting(item.meetLink!)}
          activeOpacity={0.7}>
          <View style={[styles.linkIconWrap, { backgroundColor: item.color + '18' }]}>
            <ThemedText style={styles.linkEmoji}>🔗</ThemedText>
          </View>
          <ThemedText style={[styles.linkText, { color: item.color }]} numberOfLines={1}>
            {item.meetLink}
          </ThemedText>
          <ThemedText style={[styles.chevron, { color: theme.textSecondary }]}>›</ThemedText>
        </TouchableOpacity>
      )}

      {/* ── Actions ── */}
      <View style={styles.actions}>
        {item.meetLink && (
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: item.color }]}
            onPress={() => handleJoinMeeting(item.meetLink!)}
            activeOpacity={0.85}>
            <ThemedText style={styles.primaryBtnText}>Join Live Class</ThemedText>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.secondaryBtn, { borderColor: theme.textSecondary + '45' }]}
          onPress={() => addEventToCalendar(item)}
          activeOpacity={0.8}>
          <ThemedText style={[styles.secondaryBtnText, { color: theme.textSecondary }]}>
            Add to Calendar
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12, marginBottom: 8,
  },
  scroll: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    gap: Spacing.three,
  },

  /* Title */
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two + 2,
    paddingTop: Spacing.one,
  },
  colorDot: {
    width: 12, height: 12,
    borderRadius: 6,
    marginTop: 5,
    flexShrink: 0,
  },
  titleStack: { flex: 1, gap: 4 },
  subject: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
  },
  dateText: { fontSize: 13 },

  /* Chips */
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
    borderRadius: 20,
  },
  chipText: { fontSize: 13, fontWeight: '600' },

  /* Description */
  description: { fontSize: 14, lineHeight: 21 },

  /* Meet link */
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Spacing.three,
    borderWidth: 1,
    padding: Spacing.two + 2,
  },
  linkIconWrap: {
    width: 34, height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  linkEmoji: { fontSize: 15 },
  linkText: { flex: 1, fontSize: 13, fontWeight: '500' },
  chevron: { fontSize: 20, lineHeight: 22, marginTop: -1 },

  /* Buttons */
  actions: { gap: Spacing.two, paddingTop: Spacing.one },
  primaryBtn: {
    borderRadius: Spacing.two + 4,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryBtn: {
    borderRadius: Spacing.two + 4,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  secondaryBtnText: { fontSize: 15, fontWeight: '600' },
});
