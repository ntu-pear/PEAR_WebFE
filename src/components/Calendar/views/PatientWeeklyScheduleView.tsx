import React from "react";
import { format, startOfWeek, addDays } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import {
  ScheduledPatientActivity,
  ActivityTemplate,
  Patient
} from "@/api/scheduler/scheduler";
import { ACTIVITY_STYLES, TIME_SLOTS } from "../CalendarTypes";

const CELL_HEIGHT = 72;
const MIN_ACTIVITY_HEIGHT = 32;

const timeToMinutes = (time: string): number => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};

interface PatientWeeklyScheduleViewProps {
  currentDate: Date;
  patients: Patient[];
  getPatientActivitiesForDate: (patientId: string, date: string) => ScheduledPatientActivity[];
  getActivityTemplate: (id: string) => ActivityTemplate | undefined;
  onActivityClick: (activity: ScheduledPatientActivity) => void;
}

const PatientWeeklyScheduleView: React.FC<PatientWeeklyScheduleViewProps> = ({
  currentDate,
  patients,
  getPatientActivitiesForDate,
  getActivityTemplate,
  onActivityClick,
}) => {
  const navigate = useNavigate();
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const patient = patients[0];

  const renderActivityCell = (patientId: string, date: Date, timeSlot: string) => {
    const dateString = format(date, "yyyy-MM-dd");
    const slotStartTime = timeSlot.split(" - ")[0];
    const slotHour = parseInt(slotStartTime.split(":")[0], 10);
    const activities = getPatientActivitiesForDate(patientId, dateString).filter(activity => {
      const activityStartHour = parseInt(activity.startTime.split(":")[0], 10);
      return activityStartHour === slotHour;
    });
    
    // Sort activities by start time
    const sortedActivities = activities.sort((a, b) => a.startTime.localeCompare(b.startTime));

    return (
      <div className="relative h-16 border-b border-gray-200 bg-white overflow-visible" style={{ height: `${CELL_HEIGHT}px` }}>
        {sortedActivities.map(activity => {
          const activityTemplate = getActivityTemplate(activity.activityTemplateId);
          if (!activityTemplate) return null;

          const slotStartMinutes = timeToMinutes(slotStartTime);
          const activityStartMinutes = timeToMinutes(activity.startTime);
          const activityEndMinutes = timeToMinutes(activity.endTime);
          const topOffset = ((activityStartMinutes - slotStartMinutes) / 60) * CELL_HEIGHT + 2;
          const activityHeight = Math.max(
            ((activityEndMinutes - activityStartMinutes) / 60) * CELL_HEIGHT - 4,
            MIN_ACTIVITY_HEIGHT
          );

          return (
            <div
              key={activity.id}
              className={`${ACTIVITY_STYLES.baseActivity} ${ACTIVITY_STYLES.fontColour} absolute left-1 right-1 z-[1] overflow-hidden ${
                activity.isOverridden 
                  ? ACTIVITY_STYLES.bgcolours.modified 
                  : activityTemplate.type === 'free_easy' 
                    ? ACTIVITY_STYLES.bgcolours.freeEasy 
                    : ACTIVITY_STYLES.bgcolours.routine
              } ${activityTemplate.isRarelyScheduled ? ACTIVITY_STYLES.rarelyScheduled : ''}`}
              style={{
                top: `${topOffset}px`,
                height: `${activityHeight}px`,
              }}
              onClick={() => onActivityClick(activity)}
              title={`${activityTemplate.name} (${activity.startTime} - ${activity.endTime})`}
            >
              <div className="font-semibold truncate">{activityTemplate.name}</div>
              <div className="text-[10px]">
                {activity.startTime} - {activity.endTime}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white h-full flex flex-col">
      {/* Combined scrollable container for both header and content */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-fit">
          {/* Header row - sticky */}
          <div className="bg-gray-50 border-b border-gray-200 sticky top-0 z-20">
            <div className="flex">
              {/* Time header */}
              <div className="sticky left-0 bg-gray-50 border-r border-gray-200 p-3 text-sm font-medium w-[180px] flex-shrink-0 z-30">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate">{patient ? patient.name : "Patient"}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Week of {format(weekStart, "MMM dd, yyyy")}
                    </div>
                  </div>
                  {patient && (
                    <button
                      onClick={() => navigate(`/supervisor/view-patient/${patient.id}?tab=activity-preference`)}
                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit activity preferences"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Day headers */}
              {weekDays.map(day => (
                <div
                  key={format(day, 'yyyy-MM-dd')}
                  className={`p-3 text-center text-sm font-medium w-[180px] flex-shrink-0 border-r border-gray-200 ${
                    isToday(day) ? 'text-blue-600 bg-blue-50' : ''
                  }`}
                >
                  <div>{format(day, "EEE")}</div>
                  <div className="text-xs text-gray-500 mt-1">{format(day, "MMM dd")}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Time rows */}
          {!patient ? (
            <div className="p-8 text-center text-gray-500">
              No schedule data available.
            </div>
          ) : (
            <>
              {TIME_SLOTS.map(timeSlot => (
                <div key={timeSlot} className="flex border-b border-gray-200 last:border-b-0">
                  {/* Time cell */}
                  <div className="sticky left-0 bg-white border-r border-gray-200 p-3 flex items-center justify-center w-[180px] h-16 flex-shrink-0 z-30 shadow-sm"
                  style={{ height: `${CELL_HEIGHT}px` }}
                  >
                    <div>
                      <div className="font-medium text-sm">{timeSlot}</div>
                    </div>
                  </div>
                  
                  {/* Day cells for this time */}
                  {weekDays.map(day => (
                    <div 
                      key={`${timeSlot}-${format(day, 'yyyy-MM-dd')}`} 
                      className="w-[180px] h-16 flex-shrink-0 border-r border-gray-200"
                      style={{ height: `${CELL_HEIGHT}px` }}
                    >
                      {renderActivityCell(patient.id, day, timeSlot)}
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientWeeklyScheduleView;
