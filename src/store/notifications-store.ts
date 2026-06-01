import { create } from 'zustand';

type NotifType = 'reminder' | 'change' | 'announcement';

export type NotifItem = {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  time: string;
  read: boolean;
};

const INITIAL_NOTIFS: NotifItem[] = [
  { id: '1', type: 'reminder', title: 'Class in 15 minutes', message: 'Mathematics with Mr. Sharma starts at 9:00 AM in Room 101.', time: '8:45 AM', read: false },
  { id: '2', type: 'change', title: 'Room Change – Science', message: 'Wednesday Science class has moved to Lab 5 due to maintenance in Lab 3.', time: 'Yesterday', read: false },
  { id: '3', type: 'announcement', title: 'School Holiday', message: 'School will remain closed on Friday, May 30th for the Annual Sports Day.', time: '2 days ago', read: true },
  { id: '4', type: 'reminder', title: 'Assignment Due Tomorrow', message: 'History essay due tomorrow. Submit to Mrs. Khan before 3:00 PM.', time: 'Yesterday', read: true },
  { id: '5', type: 'announcement', title: 'Parent-Teacher Meeting', message: 'Parent-Teacher Meeting scheduled for June 5th, 10:00 AM – 1:00 PM. Please ensure your parents attend.', time: '3 days ago', read: true },
  { id: '6', type: 'change', title: 'PE Class Cancelled – Friday', message: 'Physical Education on Friday has been cancelled. A free period has been scheduled instead.', time: '3 days ago', read: true },
];

type NotificationsStore = {
  notifs: NotifItem[];
  markRead: (id: string) => void;
  markAllRead: () => void;
};

export const useNotificationsStore = create<NotificationsStore>((set) => ({
  notifs: INITIAL_NOTIFS,
  markRead: (id) =>
    set((state) => ({
      notifs: state.notifs.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  markAllRead: () =>
    set((state) => ({
      notifs: state.notifs.map((n) => ({ ...n, read: true })),
    })),
}));
