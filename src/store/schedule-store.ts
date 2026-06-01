import { create } from 'zustand';

function getTodayIndex() {
  const d = new Date().getDay(); // 0=Sun, 1=Mon … 6=Sat
  // DAYS array: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] = indices 0–6
  // Mon(1)→0, Tue(2)→1, … Sat(6)→5, Sun(0)→6
  return d === 0 ? 6 : d - 1;
}

type ScheduleStore = {
  selectedDay: number;
  setSelectedDay: (day: number) => void;
  weekOffset: number;          // 0 = current week, -1 = last week, +1 = next week …
  setWeekOffset: (offset: number) => void;
};

export const useScheduleStore = create<ScheduleStore>((set) => ({
  selectedDay: getTodayIndex(),
  setSelectedDay: (day) => set({ selectedDay: day }),
  weekOffset: 0,
  setWeekOffset: (offset) => set({ weekOffset: offset }),
}));
