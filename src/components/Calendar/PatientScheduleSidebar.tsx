import React from 'react';
import { ActivityTemplate } from '@/api/activity/activity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface PatientScheduleSidebarProps {
  activityTemplates: ActivityTemplate[];
  selectedActivities: string[];
  showInactivePatients: boolean;
  onActivityToggle: (activityId: string, checked: boolean) => void;
  onPatientStatusToggle: (showInactive: boolean) => void;
}

const PatientScheduleSidebar: React.FC<PatientScheduleSidebarProps> = ({
  activityTemplates,
  selectedActivities,
  showInactivePatients,
  onActivityToggle,
  onPatientStatusToggle,
}) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <div className="space-y-4">
        {/* Patient Status Filter */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Patient Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-inactive"
                checked={showInactivePatients}
                onCheckedChange={onPatientStatusToggle}
              />
              <Label htmlFor="show-inactive" className="text-sm">
                Show inactive patients
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Activity Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Activities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activityTemplates.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={activity.id}
                  checked={selectedActivities.includes(activity.id)}
                  onChange={(e) => 
                    onActivityToggle(activity.id, e.target.checked)
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor={activity.id}
                  className="text-sm cursor-pointer flex items-center gap-2 group"
                >
                  <div
                    className={`w-3 h-3 rounded ${
                      activity.type === 'free_easy' ? 'bg-blue-400' : 'bg-orange-400'
                    } ${activity.isRarelyScheduled ? 'ring-2 ring-red-500' : ''}`}
                  />
                  <span className="truncate">{activity.name}</span>
                  {activity.isRarelyScheduled && (
                    <div className="relative">
                      <span className="text-xs text-red-600 font-bold">!</span>
                      {/* Tooltip for rarely scheduled activities */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                        Rarely Scheduled
                      </div>
                    </div>
                  )}
                </label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Legend */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Legend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-blue-400"></div>
              <span>Free & Easy</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-orange-400"></div>
              <span>Routine</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-red-400"></div>
              <span>Modified</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-gray-400 ring-2 ring-red-500"></div>
              <span>Rarely Scheduled</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientScheduleSidebar;
