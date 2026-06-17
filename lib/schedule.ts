// ─── Restaurant schedule — single source of truth ────────────────────────────
// Tue–Sat: Lunch 11:30 am–2:30 pm  |  Dinner 5:00 pm–8:30 pm
// Mon & Sun: Closed

export interface Session {
  openH:  number; openM:  number;
  closeH: number; closeM: number;
  label:  'Lunch' | 'Dinner';
  display: string; // e.g. "11:30 am – 2:30 pm"
}

export const DAILY_SESSIONS: Session[] = [
  { openH: 11, openM: 30, closeH: 14, closeM: 30, label: 'Lunch',  display: '11:30 am – 2:30 pm' },
  { openH: 17, openM: 0,  closeH: 20, closeM: 30, label: 'Dinner', display: '5:00 pm – 8:30 pm'  },
];

// 0 = Sun … 6 = Sat
export const SCHEDULE: Record<number, Session[] | null> = {
  0: null,           // Sun – Closed
  1: null,           // Mon – Closed
  2: DAILY_SESSIONS, // Tue
  3: DAILY_SESSIONS, // Wed
  4: DAILY_SESSIONS, // Thu
  5: DAILY_SESSIONS, // Fri
  6: DAILY_SESSIONS, // Sat
};

export function isOpenDay(dow: number): boolean {
  return SCHEDULE[dow] !== null;
}

export function format24to12(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

export interface SlotItem {
  time:    string;           // '11:30'
  session: 'Lunch' | 'Dinner';
}

/**
 * Generate 5-minute pickup slots for a given date.
 * - Respects lunch/dinner sessions (no slots between 2:30 pm – 5:00 pm)
 * - For today: first slot = now + prepMins, rounded up to nearest 5 min
 * - Last slot in each session is 15 min before session ends
 */
export function generatePickupSlots(date: Date, prepMins = 15): SlotItem[] {
  const dow      = date.getDay();
  const sessions = SCHEDULE[dow];
  if (!sessions) return [];

  const now     = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const nowMin  = isToday ? now.getHours() * 60 + now.getMinutes() : 0;

  const slots: SlotItem[] = [];

  for (const session of sessions) {
    const sessionOpen  = session.openH  * 60 + session.openM;
    const sessionClose = session.closeH * 60 + session.closeM;

    let startMin = sessionOpen;
    if (isToday) {
      const earliest = Math.ceil((nowMin + prepMins) / 5) * 5;
      startMin = Math.max(sessionOpen, earliest);
    }

    const endMin = sessionClose - 15; // last slot 15 min before session ends

    for (let min = startMin; min <= endMin; min += 5) {
      const hh = Math.floor(min / 60);
      const mm = min % 60;
      slots.push({
        time:    `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`,
        session: session.label,
      });
    }
  }

  return slots;
}

/** 15-minute interval slots for the reservation form (no today-filtering needed). */
export function generateReservationSlots(): { time: string; display: string; session: 'Lunch' | 'Dinner' }[] {
  const result: { time: string; display: string; session: 'Lunch' | 'Dinner' }[] = [];
  for (const session of DAILY_SESSIONS) {
    const start = session.openH  * 60 + session.openM;
    const end   = session.closeH * 60 + session.closeM - 15;
    for (let min = start; min <= end; min += 15) {
      const hh   = Math.floor(min / 60);
      const mm   = min % 60;
      const time = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
      result.push({ time, display: format24to12(time), session: session.label });
    }
  }
  return result;
}

/** Returns a YYYY-MM-DD string for a minimum bookable date (today). */
export function todayYMD(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Returns the ISO date string for the next open day (Tue–Sat) from today. */
export function nextOpenDayYMD(): string {
  const d = new Date();
  for (let i = 0; i < 7; i++) {
    const nd = new Date(d);
    nd.setDate(d.getDate() + i);
    if (isOpenDay(nd.getDay())) {
      return `${nd.getFullYear()}-${String(nd.getMonth() + 1).padStart(2, '0')}-${String(nd.getDate()).padStart(2, '0')}`;
    }
  }
  return todayYMD();
}
