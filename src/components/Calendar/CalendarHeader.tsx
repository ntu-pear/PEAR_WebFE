import React from 'react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ViewMode } from './CalendarTypes';
import { Search, Download } from 'lucide-react';

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: ViewMode;
  searchTerm: string;
  onGoToToday: () => void;
  onNavigateDate: (amount: number, unit: ViewMode) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onSearchChange: (term: string) => void;
  allowedViewModes?: ViewMode[];
  // Export functionality for patient schedule view
  showExportButton?: boolean;
  onExportSchedule?: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  viewMode,
  searchTerm,
  onGoToToday,
  onNavigateDate,
  onViewModeChange,
  onSearchChange,
  allowedViewModes,
  showExportButton = false,
  onExportSchedule,
}) => {
  const getHeaderTitle = () => {
    switch (viewMode) {
      case 'centre-monthly':
        return `Centre Activity Schedule - ${format(currentDate, 'MMMM yyyy')}`;
      case 'centre-weekly':
        return `Centre Activity Schedule - ${format(startOfWeek(currentDate, { locale: enUS }), 'MMM dd')} - ${format(endOfWeek(currentDate, { locale: enUS }), 'MMM dd, yyyy')}`;
      case 'centre-daily':
        return `Centre Activity Schedule - ${format(currentDate, 'EEEE, MMMM dd, yyyy')}`;
      case 'patient-daily':
        return `Patient Schedule - ${format(currentDate, 'EEEE, MMMM dd, yyyy')}`;
      case 'patient-weekly':
        return `Patient Schedule - ${format(startOfWeek(currentDate, { locale: enUS }), 'MMM dd')} - ${format(endOfWeek(currentDate, { locale: enUS }), 'MMM dd, yyyy')}`;
      default:
        return '';
    }
  };

  const getSearchPlaceholder = () => {
    const isPatientView = viewMode === 'patient-daily' || viewMode === 'patient-weekly';
    return isPatientView ? 'Search patients...' : 'Search activities...';
  };

  const getViewModeOptions = () => {
    const allOptions = [
      { value: 'centre-daily', label: 'Daily' },
      { value: 'centre-weekly', label: 'Weekly' },
      { value: 'centre-monthly', label: 'Monthly' },
      { value: 'patient-daily', label: 'Daily' },
      { value: 'patient-weekly', label: 'Weekly' },
    ] as const;

    if (allowedViewModes) {
      return allOptions.filter(option => allowedViewModes.includes(option.value as ViewMode));
    }

    return allOptions;
  };

  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-sm border-b">
      <div className="flex items-center space-x-2">
        <Button variant="outline" onClick={onGoToToday} className="rounded-md">
          Today
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onNavigateDate(-1, viewMode)} 
          className="rounded-md"
        >
          &lt;
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onNavigateDate(1, viewMode)} 
          className="rounded-md"
        >
          &gt;
        </Button>
        <h2 className="text-xl font-semibold">
          {getHeaderTitle()}
        </h2>
      </div>
      <div className="flex items-center space-x-2">
        {showExportButton && onExportSchedule && (
          <Button 
            variant="outline" 
            onClick={onExportSchedule}
            className="rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        )}
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500"><Search /></span>
          <Input
            placeholder={getSearchPlaceholder()}
            className="pl-8 w-64 rounded-md"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-1 bg-gray-100 rounded-md p-1">
          {getViewModeOptions().map(option => (
            <Button
              key={option.value}
              variant={viewMode === option.value ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange(option.value as ViewMode)}
              className="rounded-md"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    </header>
  );
};

export default CalendarHeader;
