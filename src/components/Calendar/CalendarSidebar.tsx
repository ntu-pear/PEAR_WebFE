import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ActivityTemplate } from '@/api/activity/activity';

interface CalendarSidebarProps {
  activityTemplates: ActivityTemplate[];
  selectedActivities: string[];
  onActivityToggle: (activityId: string, checked: boolean) => void;
}

const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
  activityTemplates,
  selectedActivities,
  onActivityToggle,
}) => {
  return (
    <aside className="w-64 p-4 bg-white border-r overflow-y-auto">
      <div className="h-full pr-4">
        {/* Activities Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 flex items-center">🏃 Activities</h3>
          <div className="space-y-2">
            {activityTemplates.map(activity => (
              <div key={activity.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`activity-${activity.id}`}
                  checked={selectedActivities.includes(activity.id)}
                  onChange={(e) => onActivityToggle(activity.id, e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor={`activity-${activity.id}`} className="cursor-pointer flex items-center">
                  {activity.name}
                  {activity.isRarelyScheduled && (
                    <div className="relative ml-2 group">
                      <span className="text-red-500 text-m font-extrabold">!</span>
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300">
                        Rarely scheduled
                      </div>
                    </div>
                  )}
                </Label>
              </div>
            ))}
          </div>
          <Button 
            variant="link" 
            className="mt-2 p-0 h-auto text-sm" 
            onClick={() => console.log('Navigate to Manage Activities')}
          >
            Manage Activities
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default CalendarSidebar;
