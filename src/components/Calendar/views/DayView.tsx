import React from "react";
import { format, isSameDay, parseISO, getHours, parse } from "date-fns";
import {
  ScheduledActivity,
  ActivityTemplate,
  Patient,
} from "@/api/activity/activity";
import { TIME_SLOTS } from "../CalendarTypes";

interface DayViewProps {
  currentDate: Date;
  filteredScheduledActivities: ScheduledActivity[];
  getActivityTemplate: (id: string) => ActivityTemplate | undefined;
  getPatient: (id: string) => Patient | undefined;
  onActivityClick: (activity: ScheduledActivity) => void;
}

const DayView: React.FC<DayViewProps> = ({
  currentDate,
  filteredScheduledActivities,
  getActivityTemplate,
  getPatient,
  onActivityClick,
}) => {
  // Helper to render activity blocks for Day view
  const renderActivityBlock = (activity: ScheduledActivity) => {
    const activityTemplate = getActivityTemplate(activity.activityTemplateId);
    const patient = getPatient(activity.patientId);

    if (!activityTemplate || !patient) return null;

    const start = parse(activity.startTime, "HH:mm", new Date());
    const end = parse(activity.endTime, "HH:mm", new Date());

    const startHour = getHours(start);
    const startMinute = start.getMinutes();
    const endHour = getHours(end);
    const endMinute = end.getMinutes();

    // Calculate position and height assuming 60px per hour
    const top = (startHour - 7) * 60 + startMinute; // Pixels from top (7:00 AM is 0px)
    const height = (endHour - startHour) * 60 + (endMinute - startMinute);

    const bgColor =
      activityTemplate.type === "free_easy" ? "bg-blue-400" : "bg-orange-400";
    const textColor = "text-white";
    const borderColor = activity.isOverridden
      ? "border-dashed border-2 border-purple-600"
      : "";
    const excludedClass = activity.isExcluded ? "opacity-50 line-through" : "";
    const rarelyScheduledClass = activityTemplate.isRarelyScheduled
      ? "border-2 border-red-500"
      : "";

    return (
      <div
        key={activity.id}
        className={`absolute w-full rounded-md p-2 text-xs cursor-pointer shadow-md ${bgColor} ${textColor} ${borderColor} ${excludedClass} ${rarelyScheduledClass}`}
        style={{ top: `${top}px`, height: `${height}px` }}
        onClick={() => onActivityClick(activity)}
      >
        <div className="font-semibold">{activityTemplate.name}</div>
        <div>{patient.name}</div>
        <div>
          {activity.startTime} - {activity.endTime}
        </div>
        {activity.isExcluded && (
          <div className="text-xs italic">
            Excluded: {activity.exclusionReason}
          </div>
        )}
        {activity.isOverridden && (
          <div className="text-xs italic">Overridden</div>
        )}
        {activityTemplate.isRarelyScheduled && (
          <div className="text-xs italic">Rarely Scheduled!</div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-[50px_1fr] gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden min-h-[600px]">
      {/* Time header */}
      <div className="p-2 text-center text-sm font-medium bg-white border-b border-gray-200">
        Time
      </div>
      {/* Day header */}
      <div className="p-2 text-center text-sm font-medium bg-white border-b border-gray-200">
        {format(currentDate, "EEEE, MMM dd")}
      </div>

      {/* Time slots and activities */}
      {TIME_SLOTS.map((time) => (
        <React.Fragment key={time}>
          <div className="p-2 text-right text-xs bg-white border-r border-gray-200 h-[60px] flex items-center justify-end">
            {time}
          </div>
          <div className="relative bg-white border-b border-gray-200 h-[60px]">
            {filteredScheduledActivities
              .filter((activity) => {
                const activityStartHour = getHours(
                  parse(activity.startTime, "HH:mm", currentDate)
                );
                return (
                  isSameDay(parseISO(activity.date), currentDate) &&
                  activityStartHour === parseInt(time.split(":")[0])
                ); // Only render in its starting slot
              })
              .map(renderActivityBlock)}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default DayView;
