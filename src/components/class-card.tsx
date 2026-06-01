import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { formatTime, handleJoinMeeting, type ClassItem } from '@/lib/event-utils';

type Props = {
  item: ClassItem;
  /** If provided, called instead of navigating to /class/:id */
  onPress?: () => void;
};

export function ClassCard({ item, onPress }: Props) {
  const router = useRouter();

  const handlePress = onPress ?? (() => router.push(`/class/${item.id}`));

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={handlePress}>
      <ThemedView type="backgroundElement" style={styles.card}>
        <View style={styles.body}>
          <View style={styles.top}>
            <ThemedText type="smallBold" style={styles.subject}>{item.subject}</ThemedText>
            <View style={[styles.timePill, { backgroundColor: item.color + '20' }]}>
              <ThemedText type="small" style={[styles.timeText, { color: item.color }]}>
                {formatTime(item.startTime)}
              </ThemedText>
            </View>
          </View>
          {!!item.description && (
            <ThemedText type="small" themeColor="textSecondary">{item.description}</ThemedText>
          )}
          <View style={styles.meta}>
            <ThemedText type="small" themeColor="textSecondary">
              {formatTime(item.startTime)} – {formatTime(item.endTime)}
            </ThemedText>
            {item.meetLink && (
              <TouchableOpacity
                style={styles.joinBtn}
                onPress={() => handleJoinMeeting(item.meetLink!)}
                activeOpacity={0.8}>
                <ThemedText type="smallBold" style={styles.joinBtnText}>Join Meeting</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', borderRadius: Spacing.three },
  body: { flex: 1, padding: Spacing.three, gap: Spacing.half },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  subject: { flex: 1, marginRight: Spacing.two },
  timePill: { paddingHorizontal: Spacing.two, paddingVertical: 3, borderRadius: Spacing.two },
  timeText: { fontSize: 12, fontWeight: '600' },
  meta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.one },
  joinBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
    backgroundColor: '#3c87f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '600' },
});
