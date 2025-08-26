import React from 'react';
import { ActivityTemplate } from '@/api/scheduler/scheduler';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RefreshCw, Calendar as CalendarIcon } from 'lucide-react';
import { ACTIVITY_STYLES } from './CalendarTypes';
import { CalendarScheduleItem } from '@/hooks/scheduler/useSchedulerService';

interface PatientScheduleSidebarProps {
  activityTemplates: ActivityTemplate[];
  selectedActivities: string[];
  showInactivePatients: boolean;
  onActivityToggle: (activityId: string, checked: boolean) => void;
  onPatientStatusToggle: (showInactive: boolean) => void;
  // Scheduler props
  isGeneratingSchedule: boolean;
  scheduleData: CalendarScheduleItem[];
  scheduleError: string | null;
  onGenerateSchedule: () => void;
  onClearSchedule: () => void;
}

const PatientScheduleSidebar: React.FC<PatientScheduleSidebarProps> = ({
  activityTemplates,
  selectedActivities,
  showInactivePatients,
  onActivityToggle,
  onPatientStatusToggle,
  isGeneratingSchedule,
  scheduleData,
  scheduleError,
  onGenerateSchedule,
  onClearSchedule,
}) => {
  // Use activityTemplates from props instead of deriving from scheduleData
  // This allows parent component to manage the activity list and filtering
  const activitiesFromSchedule = activityTemplates;

  return (
    <div className="w-100 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <div className="space-y-4">
        {/* Scheduler Controls */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Schedule Generator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={onGenerateSchedule}
              disabled={isGeneratingSchedule}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {isGeneratingSchedule ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Generate Schedule
                </>
              )}
            </Button>
            {scheduleData.length > 0 && (
              <Button
                onClick={onClearSchedule}
                variant="outline"
                className="w-full bg-white hover:bg-gray-50"
              >
                Clear Schedule
              </Button>
            )}
            {/* Schedule Status */}
            {scheduleError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-xs">
                Error: {scheduleError}
              </div>
            )}
            {scheduleData.length > 0 && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded text-xs">
                Generated schedule for {new Set(scheduleData.map(s => s.patientId)).size} patients
              </div>
            )}
          </CardContent>
        </Card>
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
        {/* Activity Filters (from scheduleData) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Activities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activitiesFromSchedule.map((activity) => (
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
                      activity.type === 'free_easy' 
                        ? ACTIVITY_STYLES.bgcolours.freeEasy 
                        : ACTIVITY_STYLES.bgcolours.routine
                    } ${activity.isRarelyScheduled ? ACTIVITY_STYLES.rarelyScheduled : ''}`}
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
              <div className={`w-3 h-3 rounded ${ACTIVITY_STYLES.bgcolours.freeEasy}`}></div>
              <span>Free & Easy</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className={`w-3 h-3 rounded ${ACTIVITY_STYLES.bgcolours.routine}`}></div>
              <span>Routine</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className={`w-3 h-3 rounded ${ACTIVITY_STYLES.bgcolours.modified}`}></div>
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
