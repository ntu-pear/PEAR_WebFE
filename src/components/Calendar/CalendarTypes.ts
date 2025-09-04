export type ViewMode = 'centre-daily' | 'centre-weekly' | 'centre-monthly' | 'patient-daily' | 'patient-weekly';

// Time slot definitions for Week/Day view itself
// Currently using 8 slots to add padding for view
export const TIME_SLOTS = Array.from({ length: 8 }, (_, i) => `${(9 + i).toString().padStart(2, '0')}:00`);

// API time slots - includes start hours and final end hour 
// ie length must be one more than the number of slots
// [9, 10, 11, 12] means slots: 9-10, 10-11, 11-12
export const API_TIME_SLOTS = Array.from({ length: 9 }, (_, i) => 9 + i);

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
