import React from "react";
import { format, parse, getHours } from "date-fns";
import {
  ScheduledPatientActivity,
  ActivityTemplate,
  Patient
} from "@/api/activity/activity";
import { TIME_SLOTS, ACTIVITY_STYLES } from "../CalendarTypes";

interface PatientDailyScheduleViewProps {
  currentDate: Date;
  patients: Patient[];
  getPatientActivitiesForTimeSlot: (patientId: string, date: string, timeSlot: string) => ScheduledPatientActivity[];
  getActivityTemplate: (id: string) => ActivityTemplate | undefined;
  onActivityClick: (activity: ScheduledPatientActivity) => void;
}

const PatientDailyScheduleView: React.FC<PatientDailyScheduleViewProps> = ({
  currentDate,
  patients,
  getPatientActivitiesForTimeSlot,
  getActivityTemplate,
  onActivityClick,
}) => {
  const dateString = format(currentDate, "yyyy-MM-dd");

  const renderActivityCell = (patientId: string, timeSlot: string) => {
    const activities = getPatientActivitiesForTimeSlot(patientId, dateString, timeSlot);
    
    return (
      <div className="relative h-16 border-b border-r border-gray-200 bg-white">
        {/* Only render activities that START in this time slot to avoid duplicates */}
        {activities
          .filter(activity => {
            const startHour = parseInt(activity.startTime.split(':')[0]);
            const slotHour = parseInt(timeSlot.split(':')[0]);
            return startHour === slotHour;
          })
          .map(activity => {
            const activityTemplate = getActivityTemplate(activity.activityTemplateId);
            if (!activityTemplate) return null;

            // Parse activity times
            const start = parse(activity.startTime, "HH:mm", new Date());
            const end = parse(activity.endTime, "HH:mm", new Date());
            
            const startHour = getHours(start);
            const startMinute = start.getMinutes();
            const endHour = getHours(end);
            const endMinute = end.getMinutes();

            // Calculate horizontal positioning
            const CELL_WIDTH = 120; // min-w-[120px] from the cell styling
            
            // Calculate left offset within the starting cell (based on start minutes)
            const leftOffset = (startMinute / 60) * CELL_WIDTH;
            
            // Calculate width: how many cells does this activity span?
            const endOffsetMinutes = endMinute;
            const hoursSpanned = endHour - startHour;
            let totalWidth = (hoursSpanned * CELL_WIDTH) + ((endOffsetMinutes / 60) * CELL_WIDTH) - leftOffset;
            
            // Boundary check: prevent activities from extending beyond the last time slot
            const activityStartSlotIndex = TIME_SLOTS.findIndex(slot => 
              parseInt(slot.split(':')[0]) === startHour
            );
            
            if (activityStartSlotIndex !== -1) {
              // Calculate maximum allowed width from current slot to end of calendar
              const remainingSlots = TIME_SLOTS.length - activityStartSlotIndex;
              const maxAllowedWidth = (remainingSlots * CELL_WIDTH) - leftOffset;
              
              // If the activity would extend beyond the calendar, clamp it to the boundary
              if (totalWidth > maxAllowedWidth) {
                totalWidth = maxAllowedWidth;
              }
            }

            return (
              <div
                key={activity.id}
                className={`${ACTIVITY_STYLES.baseActivity} ${ACTIVITY_STYLES.fontColour} absolute top-2 z-10 ${
                  activity.isOverridden 
                    ? ACTIVITY_STYLES.bgcolours.modified 
                    : activityTemplate.type === 'free_easy' 
                      ? ACTIVITY_STYLES.bgcolours.freeEasy 
                      : ACTIVITY_STYLES.bgcolours.routine
                } ${activityTemplate.isRarelyScheduled ? ACTIVITY_STYLES.rarelyScheduled : ''}`}
                style={{ 
                  left: `${leftOffset}px`,
                  width: `${Math.max(totalWidth, 60)}px`, // Minimum 60px width
                  height: '48px' // Fixed height to fit within cell
                }}
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

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Single scrollable container */}
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Header row */}
          <div className="bg-gray-50 border-b border-gray-200 sticky top-0 z-20">
            <div className="flex">
              {/* Patient header */}
              <div className="sticky left-0 bg-gray-50 border-r border-gray-200 p-3 text-center text-sm font-medium min-w-[200px] z-30">
                <div>Patient</div>
                <div className="text-xs text-gray-500 mt-1">
                  {format(currentDate, "EEEE, MMM dd")}
                </div>
              </div>
              
              {/* Time slot headers */}
              {TIME_SLOTS.map(timeSlot => (
                <div
                  key={timeSlot}
                  className="p-3 text-center text-sm font-medium border-r border-gray-200 min-w-[120px] flex-shrink-0"
                >
                  {timeSlot}
                </div>
              ))}
            </div>
          </div>

          {/* Patient rows */}
          {patients.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No patients found.
            </div>
          ) : (
            patients.map(patient => (
              <div key={patient.id} className="flex border-b border-gray-200 last:border-b-0">
                {/* Patient name cell */}
                <div className="sticky left-0 bg-white border-r border-gray-200 p-3 flex items-center min-w-[200px] z-10 shadow-sm">
                  <div>
                    <div className="font-medium text-sm">{patient.name}</div>
                    <div className={`text-xs ${patient.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                      {patient.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>
                
                {/* Time slot cells for this patient */}
                {TIME_SLOTS.map(timeSlot => (
                  <div key={`${patient.id}-${timeSlot}`} className="min-w-[120px] flex-shrink-0">
                    {renderActivityCell(patient.id, timeSlot)}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDailyScheduleView;
