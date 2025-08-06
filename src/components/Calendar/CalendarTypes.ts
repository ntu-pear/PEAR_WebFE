export type ViewMode = 'month' | 'week' | 'day';

// Time slot definitions for Week/Day view (7 AM to 7 PM)
export const TIME_SLOTS = Array.from({ length: 13 }, (_, i) => `${7 + i}:00`);
