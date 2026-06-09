import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PickupState {
  date:        string | null; // 'YYYY-MM-DD'
  time:        string | null; // '16:45' 24-hour
  displayDate: string | null; // 'Tue 09'
  displayTime: string | null; // '04:45 pm'
  isAsap:      boolean;
  isSet:       boolean;

  setPickup: (p: {
    date: string; time: string;
    displayDate: string; displayTime: string;
    isAsap: boolean;
  }) => void;
  clear: () => void;
}

export const usePickupStore = create<PickupState>()(
  persist(
    (set) => ({
      date: null, time: null, displayDate: null, displayTime: null,
      isAsap: false, isSet: false,

      setPickup: (p) => set({ ...p, isSet: true }),
      clear:     ()  => set({ date: null, time: null, displayDate: null, displayTime: null, isAsap: false, isSet: false }),
    }),
    { name: 'rin-pickup' },
  ),
);
