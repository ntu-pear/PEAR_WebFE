export type ViewMode = 'month' | 'week' | 'day' | 'patient-daily' | 'patient-weekly';

// Time slot definitions for Week/Day view (7 AM to 7 PM)
export const TIME_SLOTS = Array.from({ length: 13 }, (_, i) => `${7 + i}:00`);

// Activity styling constants - centralized for easy customization
export const ACTIVITY_STYLES = {
  // Background colors for activity types
  bgcolours: {
    freeEasy: 'bg-blue-400',
    routine: 'bg-orange-400',
    modified: 'bg-red-400',
  },

  fontColour: 'text-black',
  
  // Rarely scheduled activity styling
  rarelyScheduled: 'border-2 border-red-500',

  // base activity styling for all views
  baseActivity: 'rounded-md p-1 text-xs cursor-pointer shadow-sm',
  
  // Tooltip styling
  tooltip: 'absolute z-20 mb-1 left-1/2 -translate-x-1/2 w-max max-w-xs px-2 py-1 text-white bg-black rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap text-[10px]',
} as const;
