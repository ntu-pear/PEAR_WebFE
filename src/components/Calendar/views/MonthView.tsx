import React, { useMemo } from 'react';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, endOfWeek, isSameDay, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { ScheduledCentreActivity, ActivityTemplate } from '@/api/activity/activity';

interface MonthViewProps {
  currentDate: Date;
  filteredScheduledActivities: ScheduledCentreActivity[];
  getActivityTemplate: (id: string) => ActivityTemplate | undefined;
  onActivityClick: (activity: ScheduledCentreActivity) => void;
  onDateClick?: (date: Date) => void;
  onViewModeChange?: (mode: 'day') => void;
}

const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  filteredScheduledActivities,
  getActivityTemplate,
  onActivityClick,
  onDateClick,
  onViewModeChange,
}) => {
  const calendarDays = useMemo(() => {
    const startMonth = startOfMonth(currentDate);
    const endMonth = endOfMonth(currentDate);
    const startDate = startOfWeek(startMonth, { locale: enUS });
    const endDate = endOfWeek(endMonth, { locale: enUS });
    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  }, [currentDate]);

  return (
    <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden min-h-[600px]">
      {/* Days of the week header */}
      {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
        <div key={day} className="p-2 text-center text-sm font-medium bg-white border-b border-gray-200">
          {day}
        </div>
      ))}

      {/* Calendar Days */}
      {calendarDays.map((dayDate, index) => {
        const dayActivities = filteredScheduledActivities.filter(activity =>
          isSameDay(parseISO(activity.date), dayDate)
        );
        const isToday = isSameDay(dayDate, new Date());

        return (
          <div
            key={index}
            className={`relative p-2 h-32 border-r border-b border-gray-200 bg-white ${isToday ? 'border-2 border-blue-500' : ''}`}
            onClick={() => onDateClick?.(dayDate)}
          >
            <div className={`text-sm font-semibold ${isToday ? 'text-blue-600' : ''}`}>
              {format(dayDate, 'd') === '1'
                ? `${format(dayDate, 'MMM')} 1`
                : format(dayDate, 'd')}
            </div>
            <div className="flex flex-col space-y-1 mt-1 overflow-hidden h-[calc(100%-28px)]">
              {dayActivities.slice(0, 3).map(activity => {
                const activityTemplate = getActivityTemplate(activity.activityTemplateId);
                if (!activityTemplate) return null;

                const bgColor = activityTemplate.type === 'free_easy' ? 'bg-blue-300' : 'bg-orange-300';
                const rarelyScheduledClass = activityTemplate.isRarelyScheduled ? 'border border-red-500' : '';

                const displayTitle = `${activityTemplate.name} - ${activity.startTime} to ${activity.endTime}`;

                return (
                  <div
                    key={activity.id}
                    className={`rounded-sm px-2 py-1 text-xs truncate cursor-pointer ${bgColor} ${rarelyScheduledClass} hover:opacity-80 transition-opacity`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onActivityClick(activity);
                    }}
                    title={displayTitle}
                  >
                    <div className="font-medium truncate">{activityTemplate.name}</div>
                    <div className="text-[10px] truncate">
                      {activity.startTime}
                    </div>
                  </div>
                );
              })}
              {dayActivities.length > 3 && (
                <div
                  className="text-xs text-blue-600 cursor-pointer mt-1 hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewModeChange?.('day');
                  }}
                >
                  +{dayActivities.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MonthView;
