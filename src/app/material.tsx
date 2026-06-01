import {useMemo, useState} from 'react';
import {ScrollView, StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';

import {ScreenLayout} from '@/components/screen-layout';
import {ThemedText} from '@/components/themed-text';
import {ThemedView} from '@/components/themed-view';
import {BottomTabInset, Spacing} from '@/constants/theme';
import {useTheme} from '@/hooks/use-theme';

type MaterialType = 'pdf' | 'video' | 'slides' | 'assignment' | 'link';
type FilterType = 'all' | MaterialType;

type MaterialItem = {
  id: string;
  subject: string;
  title: string;
  type: MaterialType;
  subtitle: string;
};

const MATERIALS: MaterialItem[] = [
  { id: '1', subject: 'Physics', title: 'Kinematics – Chapter Notes', type: 'pdf', subtitle: '2.4 MB' },
  { id: '2', subject: 'Physics', title: 'Motion in Two Dimensions', type: 'video', subtitle: '45 min' },
  { id: '3', subject: 'Physics', title: 'Wave Optics Slides', type: 'slides', subtitle: '18 slides' },
  { id: '4', subject: 'Mathematics', title: 'Differential Calculus Notes', type: 'pdf', subtitle: '3.1 MB' },
  { id: '5', subject: 'Mathematics', title: 'Integration Techniques HW', type: 'assignment', subtitle: 'Due Friday' },
  { id: '6', subject: 'Mathematics', title: 'Extra Practice Problems', type: 'link', subtitle: 'Online resource' },
  { id: '7', subject: 'Mathematics', title: 'Coordinate Geometry', type: 'slides', subtitle: '22 slides' },
  { id: '8', subject: 'Chemistry', title: 'Organic Chemistry Notes', type: 'pdf', subtitle: '5.1 MB' },
  { id: '9', subject: 'Chemistry', title: 'Periodic Table Lecture', type: 'video', subtitle: '38 min' },
  { id: '10', subject: 'Chemistry', title: 'Nomenclature Assignment', type: 'assignment', subtitle: 'Due Monday' },
];

const FILTER_LABELS: Record<FilterType, string> = {
  all: 'All',
  pdf: 'PDFs',
  video: 'Videos',
  slides: 'Slides',
  assignment: 'Tasks',
  link: 'Links',
};

const FILTERS: FilterType[] = ['all', 'pdf', 'video', 'slides', 'assignment', 'link'];

const TYPE_META: Record<MaterialType, { emoji: string; color: string }> = {
  pdf: { emoji: '📄', color: '#FF3B30' },
  video: { emoji: '▶', color: '#3c87f7' },
  slides: { emoji: '▣', color: '#3c87f7' },
  assignment: { emoji: '📝', color: '#FF3B30' },
  link: { emoji: '🔗', color: '#3c87f7' },
};

function MaterialRow({ item }: { item: MaterialItem }) {
  const meta = TYPE_META[item.type];
  return (
    <TouchableOpacity activeOpacity={0.75}>
      <ThemedView type="backgroundElement" style={styles.row}>
        <View style={[styles.rowIcon, { backgroundColor: meta.color + '18', borderColor: meta.color + '40' }]}>
          <ThemedText style={{ fontSize: 16, color: meta.color }}>{meta.emoji}</ThemedText>
        </View>
        <View style={styles.rowBody}>
          <ThemedText type="smallBold" numberOfLines={1}>{item.title}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">{item.subtitle}</ThemedText>
        </View>
        <ThemedText themeColor="textSecondary" style={styles.downloadIcon}>⬇</ThemedText>
      </ThemedView>
    </TouchableOpacity>
  );
}

export default function MaterialScreen() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const theme = useTheme();

  const filtered = useMemo(() => {
    return MATERIALS.filter((m) => {
      const matchType = filter === 'all' || m.type === filter;
      const matchSearch =
        !search.trim() ||
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.subject.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });
  }, [filter, search]);

  const grouped = useMemo(() => {
    const map: Record<string, MaterialItem[]> = {};
    for (const item of filtered) {
      if (!map[item.subject]) map[item.subject] = [];
      map[item.subject].push(item);
    }
    return map;
  }, [filtered]);

  const subjects = Object.keys(grouped);

  return (
    <ScreenLayout>
      <ThemedView style={styles.header}>
        <ThemedText type="subtitle">Class Material</ThemedText>
      </ThemedView>

      <ThemedView type="backgroundElement" style={styles.searchWrap}>
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search notes, videos…"
          placeholderTextColor={theme.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
        {!!search && (
          <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7}>
            <ThemedText themeColor="textSecondary" style={{ fontSize: 16 }}>✕</ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.chip, filter === f && styles.chipActive]}
            activeOpacity={0.75}>
            <ThemedText
              type="smallBold"
              style={filter === f ? styles.chipTextActive : styles.chipText}>
              {FILTER_LABELS[f]}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={true}
        contentContainerStyle={[styles.list, { paddingBottom: BottomTabInset + Spacing.three }]}>
        {subjects.length === 0 ? (
          <ThemedView type="backgroundElement" style={styles.empty}>
            <ThemedText type="default" themeColor="textSecondary">No materials found</ThemedText>
          </ThemedView>
        ) : (
          subjects.map((subject) => (
            <View key={subject} style={styles.group}>
              <ThemedText type="smallBold" themeColor="textSecondary" style={styles.groupLabel}>
                {subject.toUpperCase()}
              </ThemedText>
              <View style={styles.groupItems}>
                {grouped[subject].map((item) => (
                  <MaterialRow key={item.id} item={item} />
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.three, paddingTop: Spacing.four, paddingBottom: Spacing.two },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  searchIcon: { fontSize: 15 },
  searchInput: { flex: 1, fontSize: 16, paddingVertical: 0 },
  filterScroll: { flexGrow: 0, flexShrink:0, marginBottom: Spacing.two },
  filterRow: { paddingHorizontal: Spacing.three, gap: Spacing.two },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one+3,
    borderRadius: Spacing.five,
    borderWidth: 1.5,
    borderColor: '#ccc',
  },
  chipActive: { backgroundColor: '#3c87f7', borderColor: '#3c87f7' },
  chipText: { color: '#888' },
  chipTextActive: { color: '#fff' },
  list: { paddingHorizontal: Spacing.three, paddingTop: Spacing.one, gap: Spacing.three },
  group: { gap: Spacing.two },
  groupLabel: { fontSize: 12, letterSpacing: 0.8, marginBottom: Spacing.one },
  groupItems: { gap: Spacing.two },
  row: { flexDirection: 'row', alignItems: 'center', padding: Spacing.three, borderRadius: Spacing.three, gap: Spacing.three },
  rowIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, flexShrink: 0 },
  rowBody: { flex: 1, gap: Spacing.half },
  downloadIcon: { fontSize: 16 },
  empty: { borderRadius: Spacing.three, padding: Spacing.four, alignItems: 'center' },
});
