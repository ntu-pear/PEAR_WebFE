import React from 'react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ViewMode } from './CalendarTypes';

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: ViewMode;
  searchTerm: string;
  onGoToToday: () => void;
  onNavigateDate: (amount: number, unit: ViewMode) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onSearchChange: (term: string) => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  viewMode,
  searchTerm,
  onGoToToday,
  onNavigateDate,
  onViewModeChange,
  onSearchChange,
}) => {
  const getHeaderTitle = () => {
    switch (viewMode) {
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      case 'week':
        return `${format(startOfWeek(currentDate, { locale: enUS }), 'MMM dd')} - ${format(endOfWeek(currentDate, { locale: enUS }), 'MMM dd, yyyy')}`;
      case 'day':
        return format(currentDate, 'EEEE, MMMM dd, yyyy');
      default:
        return '';
    }
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
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
          <Input
            placeholder="Search activities..."
            className="pl-8 w-64 rounded-md"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Select value={viewMode} onValueChange={onViewModeChange}>
          <SelectTrigger className="w-[120px] rounded-md">
            <SelectValue placeholder="View" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Day</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="month">Month</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </header>
  );
};

export default CalendarHeader;
