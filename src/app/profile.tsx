import {ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {useRouter} from 'expo-router';

import {ScreenLayout} from '@/components/screen-layout';
import {ThemedText} from '@/components/themed-text';
import {ThemedView} from '@/components/themed-view';
import {BottomTabInset, Spacing} from '@/constants/theme';
import {useProfile} from '@/hooks/use-profile';
import {useAuthStore} from '@/store/auth-store';

function getInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function formatMemberSince(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {month: 'long', year: 'numeric'});
}

type StatProps = { value: string; label: string };

function Stat({value, label}: StatProps) {
  return (
    <ThemedView type="backgroundElement" style={styles.statBox}>
      <ThemedText type="subtitle" style={styles.statValue}>{value}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">{label}</ThemedText>
    </ThemedView>
  );
}

type SettingsRowProps = { emoji: string; label: string; danger?: boolean; onPress?: () => void };

function SettingsRow({emoji, label, danger = false, onPress}: SettingsRowProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} disabled={!onPress}>
      <ThemedView style={styles.settingsRow}>
        <ThemedText style={styles.settingsEmoji}>{emoji}</ThemedText>
        <ThemedText
          type="default"
          style={[styles.settingsLabel, danger && styles.settingsDanger]}>
          {label}
        </ThemedText>
        {!danger && (
          <ThemedText themeColor="textSecondary" style={styles.settingsChevron}>›</ThemedText>
        )}
      </ThemedView>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const {student, batch, loading, error} = useProfile();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  
  const batchName = batch?.name ?? student?.batchName ?? null;
  const avatarColor = '#3c87f7';
  
  return (
    <ScreenLayout>
      <ThemedView style={styles.header}>
        <ThemedText type="subtitle">Profile</ThemedText>
      </ThemedView>
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, {paddingBottom: BottomTabInset + Spacing.three}]}>
        
        {loading ? (
          <ThemedView type="backgroundElement" style={styles.loadingCard}>
            <ActivityIndicator/>
          </ThemedView>
        ) : error ? (
          <ThemedView type="backgroundElement" style={styles.errorCard}>
            <ThemedText type="default" themeColor="textSecondary">Could not load profile</ThemedText>
          </ThemedView>
        ) : !student ? (
          <ThemedView type="backgroundElement" style={styles.errorCard}>
            <ThemedText type="default" themeColor="textSecondary">No student profile found</ThemedText>
          </ThemedView>
        ) : (
          <>
            {/* Avatar card */}
            <ThemedView type="backgroundElement" style={styles.avatarCard}>
              <View style={[styles.avatarCircle, {backgroundColor: avatarColor}]}>
                <ThemedText style={styles.avatarInitials}>{getInitials(student.displayName)}</ThemedText>
              </View>
              <ThemedText type="subtitle" style={styles.displayName}>{student.displayName}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">{student.email}</ThemedText>
              <View style={styles.pillRow}>
                {batchName && (
                  <View style={[styles.pill, {backgroundColor: avatarColor + '20'}]}>
                    <ThemedText type="smallBold" style={{color: avatarColor}}>{batchName}</ThemedText>
                  </View>
                )}
                <View style={styles.pill}>
                  <ThemedText type="smallBold" themeColor="textSecondary">
                    Since {formatMemberSince(student.createdAt)}
                  </ThemedText>
                </View>
              </View>
            </ThemedView>
            
            {/* Stats */}
            <View style={styles.statsRow}>
              <Stat value="92%" label="Attendance"/>
              <Stat value="5" label="Courses"/>
              <Stat value="3" label="Pending"/>
            </View>
            
            {/* Settings */}
            <ThemedView type="backgroundElement" style={styles.settingsCard}>
              <SettingsRow emoji="✏️" label="Edit Profile"/>
              <View style={styles.divider}/>
              <SettingsRow emoji="🔔" label="Notifications" onPress={() => router.push('/notifications')}/>
              <View style={styles.divider}/>
              <SettingsRow emoji="⬇" label="Downloads"/>
              <View style={styles.divider}/>
              <SettingsRow emoji="❓" label="Help & Support"/>
              <View style={styles.divider}/>
              <SettingsRow emoji="🚪" label="Log out" danger onPress={logout}/>
            </ThemedView>
          </>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {paddingHorizontal: Spacing.three, paddingTop: Spacing.four, paddingBottom: Spacing.three},
  scrollContent: {paddingHorizontal: Spacing.three, gap: Spacing.three},
  loadingCard: {borderRadius: Spacing.four, padding: Spacing.six, alignItems: 'center'},
  errorCard: {borderRadius: Spacing.four, padding: Spacing.four, alignItems: 'center'},
  avatarCard: {borderRadius: Spacing.four, padding: Spacing.four, alignItems: 'center', gap: Spacing.two},
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one
  },
  avatarInitials: {fontSize: 32, fontWeight: '700', color: '#ffffff'},
  displayName: {lineHeight: 38, textAlign: 'center'},
  pillRow: {flexDirection: 'row', gap: Spacing.two, flexWrap: 'wrap', justifyContent: 'center', marginTop: Spacing.one},
  pill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.five,
    backgroundColor: '#8888881a'
  },
  statsRow: {flexDirection: 'row', gap: Spacing.two},
  statBox: {flex: 1, borderRadius: Spacing.three, padding: Spacing.three, alignItems: 'center', gap: Spacing.half},
  statValue: {fontSize: 24, lineHeight: 30},
  settingsCard: {borderRadius: Spacing.four, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two},
  settingsRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.three - 2, gap: Spacing.three},
  settingsEmoji: {fontSize: 18, width: 28, textAlign: 'center'},
  settingsLabel: {flex: 1, fontSize: 16},
  settingsDanger: {color: '#FF3B30'},
  settingsChevron: {fontSize: 22, lineHeight: 22},
  divider: {backgroundColor: '#88888830', marginLeft: Spacing.three + 28},
});
