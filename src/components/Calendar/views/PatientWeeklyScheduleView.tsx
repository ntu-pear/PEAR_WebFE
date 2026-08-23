import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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
const TIME_COLUMN_WIDTH = 180;

const timeToMinutes = (time: string): number => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};

const createTimeSlots = (activities: ScheduledPatientActivity[]) => {
  if (activities.length === 0) return TIME_SLOTS;

  const startHour = Math.min(
    ...activities.map(activity => parseInt(activity.startTime.split(":")[0], 10))
  );
  const endHour = Math.max(
    ...activities.map(activity => {
      const [hour, minute] = activity.endTime.split(":").map(Number);
      return minute > 0 ? hour + 1 : hour;
    })
  );

  return Array.from({ length: Math.max(endHour - startHour, 1) }, (_, i) => {
    const hour = startHour + i;
    return `${hour.toString().padStart(2, "0")}:00 - ${(hour + 1).toString().padStart(2, "0")}:00`;
  });
};

// Returns the current-time offset in px, or null if "now" falls outside today's own activity range
// (position is relative to the full grid's first hour, but visibility is gated by today's own schedule,
// not the whole week's aggregate range, since other days may run later than today does)
const getCurrentTimeOffset = (timeSlots: string[], now: Date, todaysActivities: ScheduledPatientActivity[]) => {
  if (todaysActivities.length === 0) return null;

  const todayStartHour = Math.min(
    ...todaysActivities.map(activity => parseInt(activity.startTime.split(":")[0], 10))
  );
  const todayEndHour = Math.max(
    ...todaysActivities.map(activity => {
      const [hour, minute] = activity.endTime.split(":").map(Number);
      return minute > 0 ? hour + 1 : hour;
    })
  );

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  if (nowMinutes < todayStartHour * 60 || nowMinutes > todayEndHour * 60) return null;

  const [firstHour] = timeSlots[0].split(" - ")[0].split(":").map(Number);
  return ((nowMinutes - firstHour * 60) / 60) * CELL_HEIGHT;
};

type ScrollTarget = number | "end" | null;

// Where auto-scroll should land, gated by today's own activity range: start if before today's first activity, end if after today's last, otherwise the current-time offset relative to the full grid.
// Unlike getCurrentTimeOffset, this never disables scrolling just because "now" is outside today's activity hours, still snaps to whichever edge is closest.
const getScrollTarget = (timeSlots: string[], now: Date, todaysActivities: ScheduledPatientActivity[]): ScrollTarget => {
  if (todaysActivities.length === 0) return null;

  const todayStartHour = Math.min(
    ...todaysActivities.map(activity => parseInt(activity.startTime.split(":")[0], 10))
  );
  const todayEndHour = Math.max(
    ...todaysActivities.map(activity => {
      const [hour, minute] = activity.endTime.split(":").map(Number);
      return minute > 0 ? hour + 1 : hour;
    })
  );

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  if (nowMinutes < todayStartHour * 60) return 0;
  if (nowMinutes > todayEndHour * 60) return "end";

  const [firstHour] = timeSlots[0].split(" - ")[0].split(":").map(Number);
  return ((nowMinutes - firstHour * 60) / 60) * CELL_HEIGHT;
};

interface PatientWeeklyScheduleViewProps {
  currentDate: Date;
  patients: Patient[];
  getPatientActivitiesForDate: (patientId: string, date: string) => ScheduledPatientActivity[];
  getActivityTemplate: (id: string) => ActivityTemplate | undefined;
  onActivityClick: (activity: ScheduledPatientActivity) => void;
  scrollToCurrentTimeTrigger?: number;
}

const PatientWeeklyScheduleView: React.FC<PatientWeeklyScheduleViewProps> = ({
  currentDate,
  patients,
  getPatientActivitiesForDate,
  getActivityTemplate,
  onActivityClick,
  scrollToCurrentTimeTrigger = 0,
}) => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const consumedScrollTriggerRef = useRef(0);
  const lastWeekStartStringRef = useRef<string | null>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
  const weekStartString = format(weekStart, "yyyy-MM-dd");
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );
  const patient = patients[0];
  const isViewingCurrentWeek = weekDays.some(
    day => format(day, "yyyy-MM-dd") === format(now, "yyyy-MM-dd")
  );
  const activitiesByDate = useMemo(() => {
    const activityMap = new Map<string, ScheduledPatientActivity[]>();

    if (!patient) return activityMap;

    weekDays.forEach(day => {
      const dateString = format(day, "yyyy-MM-dd");
      activityMap.set(dateString, getPatientActivitiesForDate(patient.id, dateString));
    });

    return activityMap;
  }, [patient, weekDays, getPatientActivitiesForDate]);
  const visibleActivities = useMemo(
    () => Array.from(activitiesByDate.values()).flat(),
    [activitiesByDate]
  );
  const timeSlots = useMemo(
    () => createTimeSlots(visibleActivities),
    [visibleActivities]
  );

  const todayDateString = format(now, "yyyy-MM-dd");
  const todaysActivities = activitiesByDate.get(todayDateString) ?? [];
  const currentTimeOffset = isViewingCurrentWeek
    ? getCurrentTimeOffset(timeSlots, now, todaysActivities)
    : null;
  const scrollTarget = isViewingCurrentWeek
    ? getScrollTarget(timeSlots, now, todaysActivities)
    : null;

  useLayoutEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const isNewWeek = lastWeekStartStringRef.current !== weekStartString;
    lastWeekStartStringRef.current = weekStartString;

    const shouldScrollToNow =
      scrollTarget !== null &&
      !!patient &&
      scrollToCurrentTimeTrigger !== 0 &&
      consumedScrollTriggerRef.current !== scrollToCurrentTimeTrigger;

    if (shouldScrollToNow) {
      scrollContainer.scrollTop =
        scrollTarget === "end"
          ? scrollContainer.scrollHeight
          : Math.max(scrollTarget, 0);
      consumedScrollTriggerRef.current = scrollToCurrentTimeTrigger;
    } else if (isNewWeek) {
      scrollContainer.scrollTop = 0;
    }
  }, [weekStartString, scrollToCurrentTimeTrigger, scrollTarget, patient]);

  const renderActivityCell = (patientId: string, date: Date, timeSlot: string) => {
    const dateString = format(date, "yyyy-MM-dd");
    const slotStartTime = timeSlot.split(" - ")[0];
    const slotHour = parseInt(slotStartTime.split(":")[0], 10);
    const activities = (activitiesByDate.get(dateString) ?? []).filter(activity => {
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
              key={`${dateString}-${patientId}-${activity.id}`}
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
      <div ref={scrollContainerRef} className="flex-1 overflow-auto">
        <div className="min-w-fit">
          {/* Header row - sticky */}
          <div className="bg-gray-50 border-b border-gray-200 sticky top-0 z-40">
            <div className="flex">
              {/* Time header */}
              <div className="sticky top-0 left-0 bg-gray-50 border-r border-gray-200 p-3 text-sm font-medium w-[180px] flex-shrink-0 z-50">
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
          <div className="relative">
            {currentTimeOffset !== null && patient && (
              <div
                className="absolute left-0 right-0 h-[2px] bg-red-500 z-10 pointer-events-none"
                style={{ top: `${currentTimeOffset}px` }}
              >
                <div
                  className="absolute -top-1.5 w-3 h-3 rounded-full bg-red-500"
                  style={{ left: `${TIME_COLUMN_WIDTH - 6}px` }}
                />
              </div>
            )}
            {!patient ? (
              <div className="p-8 text-center text-gray-500">
                No schedule data available.
              </div>
            ) : (
              <>
                {timeSlots.map(timeSlot => (
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
    </div>
  );
};

export default PatientWeeklyScheduleView;
