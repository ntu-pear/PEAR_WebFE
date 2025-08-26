import React from "react";
import { format, startOfWeek, addDays } from "date-fns";
import { enUS } from "date-fns/locale";
import {
  ScheduledPatientActivity,
  ActivityTemplate,
  Patient
} from "@/api/activity/activity";
import { ACTIVITY_STYLES } from "../CalendarTypes";

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
  const weekStart = startOfWeek(currentDate, { locale: enUS });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const renderActivityCell = (patientId: string, date: Date) => {
    const dateString = format(date, "yyyy-MM-dd");
    const activities = getPatientActivitiesForDate(patientId, dateString);
    
    // Sort activities by start time
    const sortedActivities = activities.sort((a, b) => a.startTime.localeCompare(b.startTime));

    return (
      <div className="p-1 overflow-hidden">
        {sortedActivities.map(activity => {
          const activityTemplate = getActivityTemplate(activity.activityTemplateId);
          if (!activityTemplate) return null;

          return (
            <div
              key={activity.id}
              className={`${ACTIVITY_STYLES.baseActivity} ${ACTIVITY_STYLES.fontColour} mb-1 ${
                activity.isOverridden 
                  ? ACTIVITY_STYLES.bgcolours.modified 
                  : activityTemplate.type === 'free_easy' 
                    ? ACTIVITY_STYLES.bgcolours.freeEasy 
                    : ACTIVITY_STYLES.bgcolours.routine
              } ${activityTemplate.isRarelyScheduled ? ACTIVITY_STYLES.rarelyScheduled : ''}`}
              onClick={() => onActivityClick(activity)}
              title={`${activityTemplate.name} (${activity.startTime} - ${activity.endTime})`}
            >
              <div className="font-semibold truncate">{activityTemplate.name}</div>
              <div className="text-[10px] truncate">
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
              {/* Patient header */}
              <div className="sticky left-0 bg-gray-50 border-r border-gray-200 p-3 text-center text-sm font-medium w-[200px] flex-shrink-0 z-30">
                <div>Patient</div>
                <div className="text-xs text-gray-500 mt-1">
                  Week of {format(weekStart, "MMM dd, yyyy")}
                </div>
              </div>
              
              {/* Day headers */}
              {weekDays.map(day => (
                <div
                  key={format(day, 'yyyy-MM-dd')}
                  className={`p-3 text-center text-sm font-medium w-[140px] flex-shrink-0 border-r border-gray-200 ${
                    isToday(day) ? 'text-blue-600 bg-blue-50' : ''
                  }`}
                >
                  <div>{format(day, "EEE")}</div>
                  <div className="text-xs text-gray-500 mt-1">{format(day, "MMM dd")}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Patient rows */}
          {patients.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Generate a schedule to view patient activities.
            </div>
          ) : (
            patients.map(patient => {
              // Calculate the maximum height needed for this patient's row
              const maxActivitiesInDay = Math.max(
                ...weekDays.map(day => {
                  const dateString = format(day, "yyyy-MM-dd");
                  const activities = getPatientActivitiesForDate(patient.id, dateString);
                  return activities.length;
                }),
                1 // Minimum 1 to ensure some height
              );
              const rowHeight = Math.max(60, maxActivitiesInDay * 30 + 16); // 16px for padding

              return (
                <div key={patient.id} className="flex border-b border-gray-200 last:border-b-0" style={{ minHeight: `${rowHeight}px` }}>
                  {/* Patient name cell */}
                  <div className="sticky left-0 bg-white border-r border-gray-200 p-3 flex items-center w-[200px] flex-shrink-0 z-10 shadow-sm">
                    <div>
                      <div className="font-medium text-sm">{patient.name}</div>
                      <div className={`text-xs ${patient.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                        {patient.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Day cells for this patient */}
                  {weekDays.map(day => (
                    <div 
                      key={`${patient.id}-${format(day, 'yyyy-MM-dd')}`} 
                      className="w-[140px] flex-shrink-0 border-r border-gray-200"
                      style={{ minHeight: `${rowHeight}px` }}
                    >
                      {renderActivityCell(patient.id, day)}
                    </div>
                  ))}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientWeeklyScheduleView;
