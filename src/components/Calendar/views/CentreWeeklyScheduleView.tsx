import React from "react";
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  parseISO,
  parse,
} from "date-fns";
import { enUS } from "date-fns/locale";
import {
  ScheduledCentreActivity,
  ActivityTemplate,
} from "@/api/activity/activity";
import { TIME_SLOTS, ACTIVITY_STYLES } from "../CalendarTypes";

interface CentreWeeklyScheduleViewProps {
  currentDate: Date;
  filteredScheduledActivities: ScheduledCentreActivity[];
  getActivityTemplate: (id: string) => ActivityTemplate | undefined;
  onActivityClick: (activity: ScheduledCentreActivity) => void;
}

const CentreWeeklyScheduleView: React.FC<CentreWeeklyScheduleViewProps> = ({
  currentDate,
  filteredScheduledActivities,
  getActivityTemplate,
  onActivityClick,
}) => {
  const renderActivityBlock = (activity: ScheduledCentreActivity) => {
    const activityTemplate = getActivityTemplate(activity.activityTemplateId);
    if (!activityTemplate) return null;

    const start = parse(activity.startTime, "HH:mm", new Date());
    const end = parse(activity.endTime, "HH:mm", new Date());

    const startHour = start.getHours();
    const startMinute = start.getMinutes();
    const endHour = end.getHours();
    const endMinute = end.getMinutes();

    // Calculate position and height relative to the current time slot
    const top = (startHour - 7) * 60 + startMinute;
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
          <div className="absolute z-20 w-full px-2 py-1 text-white bg-black rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap truncate">
            <div>Rarely Scheduled</div>
          </div>
        )}
      </div>
    );
  };

  const weekStart = startOfWeek(currentDate, { locale: enUS });

  return (
    <div className="grid grid-cols-[50px_repeat(7,1fr)] gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden min-h-[600px]">
      {/* Header row */}
      <div className="p-2 text-center text-sm font-medium bg-white border-b border-gray-200">
        Time
      </div>
      {Array.from({ length: 7 }).map((_, i) => {
        const dayDate = addDays(weekStart, i);
        const isToday = isSameDay(dayDate, new Date());
        return (
          <div
            key={i}
            className={`p-2 text-center text-sm font-medium bg-white border-b border-gray-200 ${isToday ? "text-blue-600" : ""}`}
          >
            {format(dayDate, "EEE d")}
          </div>
        );
      })}

      {/* Time column (hour labels) */}
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

      {/* Day columns with full height activity rendering */}
      {Array.from({ length: 7 }).map((_, dayIndex) => {
        const dayDate = addDays(weekStart, dayIndex);
        const activitiesForThisDay = filteredScheduledActivities.filter(
          (activity) => isSameDay(parseISO(activity.date), dayDate)
        );

        return (
          <div
            key={dayIndex}
            className="relative bg-white border-r border-gray-200"
          >
            {/* Render time slot lines */}
            {TIME_SLOTS.map((_, i) => (
              <div key={i} className="border-b border-gray-200 h-[60px]" />
            ))}

            {/* Render activities absolutely */}
            <div className="absolute top-0 left-0 w-full h-full">
              {activitiesForThisDay.map(renderActivityBlock)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CentreWeeklyScheduleView;
