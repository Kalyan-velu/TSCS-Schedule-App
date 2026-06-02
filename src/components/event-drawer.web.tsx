import { Drawer } from 'vaul';

import { useTheme } from '@/hooks/use-theme';
import { addEventToCalendar, formatTime, handleJoinMeeting, type ClassItem } from '@/lib/event-utils';

type Props = {
  item: ClassItem | null;
  onClose: () => void;
};

export function EventDrawer({ item, onClose }: Props) {
  const theme = useTheme();

  return (
    <Drawer.Root open={!!item} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Drawer.Portal>
        <Drawer.Overlay style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9998 }} />
        <Drawer.Content
          aria-label="Event details"
          style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            zIndex: 9999,
            background: theme.backgroundElement,
            borderRadius: '28px 28px 0 0',
            maxHeight: '90dvh',
            display: 'flex',
            flexDirection: 'column',
            outline: 'none',
          }}>
          {/* Drag handle */}
          <div style={{ width: 40, height: 4, borderRadius: 2, background: theme.textSecondary + '50', margin: '12px auto 8px', flexShrink: 0 }} />

          {item && <Content item={item} onClose={onClose} theme={theme} />}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

type Theme = ReturnType<typeof useTheme>;

function Content({ item, onClose: _onClose, theme }: { item: ClassItem; onClose: () => void; theme: Theme }) {
  const duration = Math.round(
    (item.endDate.getTime() - item.startDate.getTime()) / 60_000,
  );
  const dateLabel = item.startDate.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const timeLabel = `${formatTime(item.startTime)} – ${formatTime(item.endTime)}`;

  return (
    <div style={{ overflowY: 'auto', flex: 1, padding: '8px 24px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Subject + date ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, paddingTop: 4 }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: item.color, marginTop: 6, flexShrink: 0 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: theme.text, lineHeight: '28px' }}>
            {item.subject}
          </div>
          <div style={{ fontSize: 13, color: theme.textSecondary }}>
            {dateLabel}
          </div>
        </div>
      </div>

      {/* ── Time + duration chips ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ padding: '6px 14px', borderRadius: 20, background: item.color + '18', fontSize: 13, fontWeight: 600, color: item.color }}>
          {timeLabel}
        </span>
        <span style={{ padding: '6px 14px', borderRadius: 20, background: theme.background, fontSize: 13, fontWeight: 600, color: theme.textSecondary }}>
          {duration} min
        </span>
      </div>

      {/* ── Description ── */}
      {!!item.description && (
        <div style={{ fontSize: 14, color: theme.textSecondary, lineHeight: '21px' }}>
          {item.description}
        </div>
      )}

      {/* ── Meet link ── */}
      {item.meetLink && (
        <button
          onClick={() => handleJoinMeeting(item.meetLink!)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            width: '100%', padding: '10px 12px',
            background: theme.background,
            border: `1px solid ${theme.textSecondary}25`,
            borderRadius: 14,
            cursor: 'pointer',
            textAlign: 'left',
          }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: item.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 15 }}>
            🔗
          </div>
          <div style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontSize: 13, fontWeight: 500, color: item.color }}>
            {item.meetLink}
          </div>
          <div style={{ fontSize: 20, color: theme.textSecondary, lineHeight: 1 }}>›</div>
        </button>
      )}

      {/* ── Actions ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
        {item.meetLink && (
          <button
            onClick={() => handleJoinMeeting(item.meetLink!)}
            style={{ ...btnBase, background: item.color, color: '#fff', border: 'none', fontSize: 16, fontWeight: 700 }}>
            Join Live Class
          </button>
        )}
        <button
          onClick={() => addEventToCalendar(item)}
          style={{ ...btnBase, background: 'transparent', color: theme.textSecondary, border: `1.5px solid ${theme.textSecondary}45`, fontSize: 15, fontWeight: 600 }}>
          Add to Calendar
        </button>
      </div>
    </div>
  );
}

const btnBase: React.CSSProperties = {
  width: '100%',
  padding: '14px 0',
  borderRadius: 12,
  cursor: 'pointer',
  textAlign: 'center',
};
