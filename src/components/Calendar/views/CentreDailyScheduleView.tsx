import React from "react";
import { format, isSameDay, parseISO, getHours, parse } from "date-fns";
import {
  ScheduledCentreActivity,
  ActivityTemplate,
} from "@/api/activity/activity";
import { TIME_SLOTS, ACTIVITY_STYLES } from "../CalendarTypes";

interface CentreDailyScheduleViewProps {
  currentDate: Date;
  filteredScheduledActivities: ScheduledCentreActivity[];
  getActivityTemplate: (id: string) => ActivityTemplate | undefined;
  onActivityClick: (activity: ScheduledCentreActivity) => void;
}

const CentreDailyScheduleView: React.FC<CentreDailyScheduleViewProps> = ({
  currentDate,
  filteredScheduledActivities,
  getActivityTemplate,
  onActivityClick,
}) => {
  // Helper to render activity blocks for Day view
  const renderActivityBlock = (activity: ScheduledCentreActivity) => {
    const activityTemplate = getActivityTemplate(activity.activityTemplateId);
    if (!activityTemplate) return null;

    const start = parse(activity.startTime, "HH:mm", new Date());
    const end = parse(activity.endTime, "HH:mm", new Date());

    const startHour = getHours(start);
    const startMinute = start.getMinutes();
    const endHour = getHours(end);
    const endMinute = end.getMinutes();

    // Calculate position and height relative to the current time slot
    const top = (startHour - 9) * 60 + startMinute;
    const durationMinutes =
      (endHour - startHour) * 60 + (endMinute - startMinute);
    const height = Math.max(20, durationMinutes); // Minimum 20px height

    return (
      <div
        key={activity.id}
        className={`${ACTIVITY_STYLES.baseActivity} ${ACTIVITY_STYLES.fontColour} group absolute w-[calc(100%-4px)] left-[2px] ${
          activityTemplate.type === 'free_easy' 
            ? ACTIVITY_STYLES.bgcolours.freeEasy 
            : ACTIVITY_STYLES.bgcolours.routine
        } ${activityTemplate.isRarelyScheduled ? ACTIVITY_STYLES.rarelyScheduled : ''}`}
        style={{ top: `${top}px`, height: `${height}px` }}
        onClick={() => onActivityClick(activity)}
      >
        <div className="font-semibold truncate">{activityTemplate.name}</div>
        <div className="text-[10px]">
          {activity.startTime} - {activity.endTime}
        </div>

        {/* Tooltip for rarely scheduled activities */}
        {activityTemplate.isRarelyScheduled && (
          <div className="absolute z-20 mb-1 left-1/2 -translate-x-1/2 w-max max-w-xs px-2 py-1 text-white bg-black rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap text-[10px]">
            <div>Rarely Scheduled</div>
          </div>
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

      {/* Time column */}
      <div>
        {TIME_SLOTS.map((time) => (
          <div
            key={time}
            className="px-2 text-right text-xs bg-white border-r border-gray-200 h-[60px] flex justify-end"
          >
            {time}
          </div>
        ))}
      </div>

      {/* Activity column */}
      <div className="relative bg-white">
        {/* This div will be as tall as all time slots combined */}
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Render activities here */}
          {filteredScheduledActivities
            .filter((activity) =>
              isSameDay(parseISO(activity.date), currentDate)
            )
            .map((activity) => renderActivityBlock(activity))}
        </div>

        {/* Render time slot lines for visual grid */}
        {TIME_SLOTS.map((time) => (
          <div key={time} className="border-b border-gray-200 h-[60px]" />
        ))}
      </div>
    </div>
  );
};

export default CentreDailyScheduleView;
