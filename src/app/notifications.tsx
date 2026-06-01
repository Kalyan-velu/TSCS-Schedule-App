import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ScreenLayout } from '@/components/screen-layout';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useNotificationsStore } from '@/store/notifications-store';

type NotifType = 'reminder' | 'change' | 'announcement';

const TYPE_CONFIG: Record<NotifType, { emoji: string; color: string; label: string }> = {
  reminder: { emoji: '⏰', color: '#3c87f7', label: 'Reminder' },
  change: { emoji: '🔄', color: '#FF3B30', label: 'Schedule Change' },
  announcement: { emoji: '📢', color: '#3c87f7', label: 'Announcement' },
};

export default function NotificationsScreen() {
  const { notifs, markRead, markAllRead } = useNotificationsStore();
  const unreadCount = notifs.filter((n) => !n.read).length;

  return (
    <ScreenLayout>
      <ThemedView style={styles.header}>
        <View style={styles.headerRow}>
          <ThemedText type="subtitle">Notifications</ThemedText>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <ThemedText style={styles.unreadBadgeText}>{unreadCount}</ThemedText>
            </View>
          )}
        </View>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllRead} activeOpacity={0.7}>
            <ThemedText type="small" themeColor="textSecondary">Mark all as read</ThemedText>
          </TouchableOpacity>
        ) : (
          <ThemedText type="small" themeColor="textSecondary">All caught up!</ThemedText>
        )}
      </ThemedView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: BottomTabInset + Spacing.three }]}
        showsVerticalScrollIndicator={false}>
        {notifs.map((notif) => {
          const cfg = TYPE_CONFIG[notif.type];
          return (
            <TouchableOpacity
              key={notif.id}
              onPress={() => markRead(notif.id)}
              activeOpacity={0.75}
              disabled={notif.read}>
              <ThemedView
                type={notif.read ? 'backgroundElement' : 'background'}
                style={[styles.card, !notif.read && { borderWidth: 1, borderColor: '#3c87f730' }]}>
                <View style={[styles.iconCircle, { backgroundColor: cfg.color + '20' }]}>
                  <ThemedText style={styles.emoji}>{cfg.emoji}</ThemedText>
                </View>
                <View style={styles.content}>
                  <View style={styles.contentHeader}>
                    <ThemedText type="smallBold" style={styles.title}>{notif.title}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">{notif.time}</ThemedText>
                  </View>
                  <ThemedText type="small" themeColor="textSecondary" style={styles.message}>
                    {notif.message}
                  </ThemedText>
                  <View style={[styles.typeTag, { backgroundColor: cfg.color + '20' }]}>
                    <ThemedText style={[styles.typeTagText, { color: cfg.color }]}>{cfg.label}</ThemedText>
                  </View>
                </View>
                {!notif.read && <View style={styles.unreadDot} />}
              </ThemedView>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.three, paddingTop: Spacing.four, paddingBottom: Spacing.three, gap: Spacing.one },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  unreadBadge: { backgroundColor: '#3c87f7', borderRadius: 12, minWidth: 24, height: 24, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.two },
  unreadBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.three, gap: Spacing.two },
  card: { flexDirection: 'row', padding: Spacing.three, borderRadius: Spacing.three, gap: Spacing.three, alignItems: 'flex-start' },
  iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  emoji: { fontSize: 20 },
  content: { flex: 1, gap: Spacing.one },
  contentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { flex: 1, marginRight: Spacing.two },
  message: { lineHeight: 20 },
  typeTag: { alignSelf: 'flex-start', paddingHorizontal: Spacing.two, paddingVertical: 3, borderRadius: Spacing.two },
  typeTagText: { fontSize: 11, fontWeight: '600' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3c87f7', flexShrink: 0, marginTop: Spacing.one },
});
