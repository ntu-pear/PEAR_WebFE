import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { format, parse, getHours } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import {
  ScheduledPatientActivity,
  ActivityTemplate,
  Patient
} from "@/api/scheduler/scheduler";
import { TIME_SLOTS, ACTIVITY_STYLES } from "../CalendarTypes";

const CELL_WIDTH = 120;
const CELL_HEIGHT = 64;
const ACTIVITY_TOP = 8;
const ACTIVITY_HEIGHT = 48;
const PATIENT_COLUMN_WIDTH = 200;

const getHourFromSlot = (timeSlot: string) => {
  const slotStart = timeSlot.split(" - ")[0];
  return parseInt(slotStart.split(":")[0], 10);
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

// Returns the current-time offset in px, or null if "now" falls outside the rendered range.
// Used only for the visible red line, which should disappear outside actual activity hours.
const getCurrentTimeOffset = (timeSlots: string[], now: Date) => {
  const [firstHour] = timeSlots[0].split(" - ")[0].split(":").map(Number);
  const [lastHour] = timeSlots[timeSlots.length - 1].split(" - ")[1].split(":").map(Number);
  const nowHour = now.getHours() + now.getMinutes() / 60;

  if (nowHour < firstHour || nowHour > lastHour) return null;

  return (nowHour - firstHour) * CELL_WIDTH;
};

type ScrollTarget = number | "end" | null;

// Where auto-scroll should land: start if before the first activity, end if after the last, otherwise the current-time offset.
// Unlike getCurrentTimeOffset, this never disables scrolling just because "now" is outside activity hours, still snaps to whichever edge is closest.
const getScrollTarget = (activities: ScheduledPatientActivity[], now: Date): ScrollTarget => {
  if (activities.length === 0) return null;

  const startHour = Math.min(...activities.map(activity => parseInt(activity.startTime.split(":")[0], 10)));
  const endHour = Math.max(
    ...activities.map(activity => {
      const [hour, minute] = activity.endTime.split(":").map(Number);
      return minute > 0 ? hour + 1 : hour;
    })
  );
  const nowHour = now.getHours() + now.getMinutes() / 60;

  if (nowHour < startHour) return 0;
  if (nowHour > endHour) return "end";

  return (nowHour - startHour) * CELL_WIDTH;
};

interface PatientDailyScheduleViewProps {
  currentDate: Date;
  patients: Patient[];
  getPatientActivitiesForDate: (patientId: string, date: string) => ScheduledPatientActivity[];
  getActivityTemplate: (id: string) => ActivityTemplate | undefined;
  onActivityClick: (activity: ScheduledPatientActivity) => void;
  scrollToCurrentTimeTrigger?: number;
}

const PatientDailyScheduleView: React.FC<PatientDailyScheduleViewProps> = ({
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
  const lastDateStringRef = useRef<string | null>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const dateString = format(currentDate, "yyyy-MM-dd");
  const isViewingToday = dateString === format(now, "yyyy-MM-dd");
  const activitiesByPatient = useMemo(() => {
    const activityMap = new Map<string, ScheduledPatientActivity[]>();

    patients.forEach(patient => {
      activityMap.set(patient.id, getPatientActivitiesForDate(patient.id, dateString));
    });

    return activityMap;
  }, [patients, getPatientActivitiesForDate, dateString]);
  const visibleActivities = useMemo(
    () => Array.from(activitiesByPatient.values()).flat(),
    [activitiesByPatient]
  );
  const timeSlots = useMemo(
    () => createTimeSlots(visibleActivities),
    [visibleActivities]
  );

  const currentTimeOffset = isViewingToday ? getCurrentTimeOffset(timeSlots, now) : null;
  const scrollTarget = isViewingToday ? getScrollTarget(visibleActivities, now) : null;

  useLayoutEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const isNewDate = lastDateStringRef.current !== dateString;
    lastDateStringRef.current = dateString;

    const shouldScrollToNow =
      scrollTarget !== null &&
      patients.length > 0 &&
      scrollToCurrentTimeTrigger !== 0 &&
      consumedScrollTriggerRef.current !== scrollToCurrentTimeTrigger;

    if (shouldScrollToNow) {
      scrollContainer.scrollLeft =
        scrollTarget === "end"
          ? scrollContainer.scrollWidth
          : Math.max(scrollTarget - PATIENT_COLUMN_WIDTH, 0);
      consumedScrollTriggerRef.current = scrollToCurrentTimeTrigger;
    } else if (isNewDate) {
      scrollContainer.scrollLeft = 0;
    }
  }, [dateString, scrollToCurrentTimeTrigger, scrollTarget, patients.length]);

  const renderActivityCell = (patientId: string, timeSlot: string) => {
    const activities = activitiesByPatient.get(patientId) ?? [];
    
    return (
      <div className="relative h-16 border-b border-r border-gray-200 bg-white">
        {/* Only render activities that START in this time slot to avoid duplicates */}
        {activities
          .filter(activity => {
            const startHour = parseInt(activity.startTime.split(':')[0]);
            // Extract start hour from "HH:MM - HH:MM" format
            const slotHour = getHourFromSlot(timeSlot);
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

            // Calculate left offset within the starting cell (based on start minutes)
            const leftOffset = (startMinute / 60) * CELL_WIDTH;
            
            // Calculate width: how many cells does this activity span?
            const endOffsetMinutes = endMinute;
            const hoursSpanned = endHour - startHour;
            let totalWidth = (hoursSpanned * CELL_WIDTH) + ((endOffsetMinutes / 60) * CELL_WIDTH) - leftOffset;
            
            // Boundary check: prevent activities from extending beyond the last time slot
            const activityStartSlotIndex = timeSlots.findIndex(slot => getHourFromSlot(slot) === startHour);
            
            if (activityStartSlotIndex !== -1) {
              // Calculate maximum allowed width from current slot to end of calendar
              const remainingSlots = timeSlots.length - activityStartSlotIndex;
              const maxAllowedWidth = (remainingSlots * CELL_WIDTH) - leftOffset;
              
              // If the activity would extend beyond the calendar, clamp it to the boundary
              if (totalWidth > maxAllowedWidth) {
                totalWidth = maxAllowedWidth;
              }
            }

            return (
              <div
                key={`${dateString}-${patientId}-${activity.id}`}
                className={`${ACTIVITY_STYLES.baseActivity} ${ACTIVITY_STYLES.fontColour} absolute z-[1] ${
                  activity.isOverridden 
                    ? ACTIVITY_STYLES.bgcolours.modified 
                    : activityTemplate.type === 'free_easy' 
                      ? ACTIVITY_STYLES.bgcolours.freeEasy 
                      : ACTIVITY_STYLES.bgcolours.routine
                } ${activityTemplate.isRarelyScheduled ? ACTIVITY_STYLES.rarelyScheduled : ''}`}
                style={{ 
                  left: `${leftOffset}px`,
                  width: `${Math.max(totalWidth, 60)}px`, // Minimum 60px width
                  top: `${ACTIVITY_TOP}px`,
                  height: `${ACTIVITY_HEIGHT}px`
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
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white h-full flex flex-col">
      {/* Combined scrollable container for both header and content */}
      <div ref={scrollContainerRef} className="flex-1 overflow-auto">
        <div className="min-w-fit">
          {/* Header row - sticky */}
          <div className="bg-gray-50 border-b border-gray-200 sticky top-0 z-40">
            <div className="flex">
              {/* Patient header */}
              <div className="sticky top-0 left-0 bg-gray-50 border-r border-gray-200 p-3 text-center text-sm font-medium w-[200px] z-50">
                <div>Patient</div>
                <div className="text-xs text-gray-500 mt-1">
                  {format(currentDate, "EEEE, MMM dd")}
                </div>
              </div>

              {/* Time slot headers */}
              {timeSlots.map(timeSlot => (
                <div
                  key={timeSlot}
                  className="p-3 text-center text-sm font-medium border-r border-gray-200 w-[120px]"
                >
                  {timeSlot}
                </div>
              ))}
            </div>
          </div>

          {/* Patient rows */}
          <div className="relative">
            {currentTimeOffset !== null && patients.length > 0 && (
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-red-500 z-20 pointer-events-none"
                style={{ left: `${PATIENT_COLUMN_WIDTH + currentTimeOffset}px` }}
              >
                <div className="absolute -top-1.5 -left-[5px] w-3 h-3 rounded-full bg-red-500" />
              </div>
            )}
            {patients.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No schedule data available.
              </div>
            ) : (
              patients.map(patient => (
                <div key={`${dateString}-${patient.id}`} className="flex border-b border-gray-200 last:border-b-0">
                  {/* Patient name cell */}
                  <div className="sticky left-0 bg-white border-r border-gray-200 p-3 flex items-center justify-between w-[200px] z-30 shadow-sm">
                    <div>
                      <div className="font-medium text-sm">{patient.name}</div>
                    </div>
                    <button
                      onClick={() => navigate(`/supervisor/view-patient/${patient.id}?tab=activity-preference`)}
                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit activity preferences"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Time slot cells for this patient */}
                  {timeSlots.map(timeSlot => (
                    <div
                      key={`${dateString}-${patient.id}-${timeSlot}`}
                      className="w-[120px] border-r border-gray-200"
                      style={{ height: `${CELL_HEIGHT}px` }}
                    >
                      {renderActivityCell(patient.id, timeSlot)}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDailyScheduleView;
