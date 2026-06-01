import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ScreenLayout } from '@/components/screen-layout';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useClassDetail } from '@/hooks/use-class-detail';
import { formatTime, handleJoinMeeting } from '@/lib/event-utils';

const MOCK_ATTACHMENTS = [
  { id: 'a1', type: 'pdf' as const, label: 'Chapter Notes', action: 'Open' },
  { id: 'a2', type: 'task' as const, label: 'Assignment', action: 'Due Fri' },
];

const ATTACHMENT_COLOR: Record<string, string> = {
  pdf: '#FF3B30',
  task: '#3c87f7',
};

function AttachmentIcon({ type }: { type: string }) {
  const color = ATTACHMENT_COLOR[type] ?? '#3c87f7';
  return (
    <View style={[styles.attachIcon, { backgroundColor: color + '18', borderColor: color + '40' }]}>
      <ThemedText style={{ fontSize: 14, color }}>{type === 'pdf' ? '📄' : '📝'}</ThemedText>
    </View>
  );
}

export default function ClassDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { classItem, loading, error } = useClassDetail(id ?? '');

  return (
    <ScreenLayout>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ThemedText style={styles.backArrow}>‹</ThemedText>
          <ThemedText type="smallBold">Back</ThemedText>
        </TouchableOpacity>
        <ThemedText type="smallBold" style={styles.headerTitle}>Class Details</ThemedText>
        <View style={styles.headerRight} />
      </ThemedView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {loading ? (
          <ThemedView type="backgroundElement" style={styles.loadingCard}>
            <ActivityIndicator />
          </ThemedView>
        ) : error || !classItem ? (
          <ThemedView type="backgroundElement" style={styles.errorCard}>
            <ThemedText type="default" themeColor="textSecondary">
              {error ?? 'Class not found'}
            </ThemedText>
          </ThemedView>
        ) : (
          <>
            <ThemedView
              type="backgroundElement"
              style={styles.heroCard}>
              <View style={styles.heroBadgeRow}>
                <View style={[styles.liveBadge, { backgroundColor: classItem.color + '20' }]}>
                  <View style={[styles.liveDot, { backgroundColor: classItem.color }]} />
                  <ThemedText type="smallBold" style={{ color: classItem.color, fontSize: 11, letterSpacing: 0.8 }}>
                    LIVE
                  </ThemedText>
                </View>
              </View>
              <ThemedText type="subtitle" style={styles.heroTitle}>{classItem.subject}</ThemedText>
              {!!classItem.description && (
                <ThemedText type="small" themeColor="textSecondary">{classItem.description}</ThemedText>
              )}
              <View style={styles.metaList}>
                <View style={styles.metaRow}>
                  <ThemedText style={styles.metaEmoji}>🕐</ThemedText>
                  <ThemedText type="small">
                    {formatTime(classItem.startTime)} – {formatTime(classItem.endTime)}
                  </ThemedText>
                </View>
                <View style={styles.metaRow}>
                  <ThemedText style={styles.metaEmoji}>📅</ThemedText>
                  <ThemedText type="small">
                    {classItem.startDate.toLocaleDateString('en-IN', {
                      weekday: 'long', day: 'numeric', month: 'long',
                    })}
                  </ThemedText>
                </View>
              </View>
              {classItem.meetLink && (
                <TouchableOpacity
                  style={[styles.joinBtn, { backgroundColor: classItem.color }]}
                  onPress={() => handleJoinMeeting(classItem.meetLink!)}
                  activeOpacity={0.85}>
                  <ThemedText style={styles.joinBtnText}>▶  Join Live Class</ThemedText>
                </TouchableOpacity>
              )}
            </ThemedView>

            <ThemedView type="backgroundElement" style={styles.section}>
              <ThemedText type="smallBold" style={styles.sectionLabel}>ATTACHED</ThemedText>
              {MOCK_ATTACHMENTS.map((item) => (
                <View key={item.id} style={styles.attachRow}>
                  <AttachmentIcon type={item.type} />
                  <ThemedText type="smallBold" style={styles.attachLabel}>{item.label}</ThemedText>
                  <View style={{ flex: 1 }} />
                  <ThemedText
                    type="small"
                    style={[
                      styles.attachAction,
                      { color: ATTACHMENT_COLOR[item.type] ?? '#3c87f7' },
                    ]}>
                    {item.action}
                  </ThemedText>
                </View>
              ))}
            </ThemedView>
          </>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.two,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  backArrow: { fontSize: 28, lineHeight: 28, marginTop: -2 },
  headerTitle: { flex: 1, textAlign: 'center' },
  headerRight: { width: 60 },
  scrollContent: { padding: Spacing.three, gap: Spacing.three },
  loadingCard: { borderRadius: Spacing.four, padding: Spacing.six, alignItems: 'center' },
  errorCard: { borderRadius: Spacing.four, padding: Spacing.four, alignItems: 'center' },
  heroCard: { borderRadius: Spacing.four, padding: Spacing.four, gap: Spacing.three },
  heroBadgeRow: { flexDirection: 'row' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  liveDot: { width: 7, height: 7, borderRadius: 3.5 },
  heroTitle: { lineHeight: 38 },
  metaList: { gap: Spacing.two },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  metaEmoji: { fontSize: 15 },
  joinBtn: {
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two + 4,
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  joinBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  section: { borderRadius: Spacing.four, padding: Spacing.four, gap: Spacing.three },
  sectionLabel: { fontSize: 12, letterSpacing: 0.8, opacity: 0.6, textTransform: 'uppercase' },
  attachRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  attachIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  attachLabel: { flex: 1 },
  attachAction: { fontSize: 13, fontWeight: '600' },
});
