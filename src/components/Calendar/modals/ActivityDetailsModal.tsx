import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { format, parseISO } from 'date-fns';
import { ScheduledCentreActivity, ActivityTemplate } from '@/api/activity/activity';
import { Calendar, Clock, Pencil, Trash } from 'lucide-react';

interface ActivityDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: ScheduledCentreActivity;
  getActivityTemplate: (id: string) => ActivityTemplate | undefined;
  handleEditActivity: (activity: ScheduledCentreActivity) => void;
  handleDeleteActivity: (activityId: string) => void;
}

const ActivityDetailsModal: React.FC<ActivityDetailsModalProps> = ({
  isOpen,
  onClose,
  activity,
  getActivityTemplate,
  handleEditActivity,
  handleDeleteActivity,
}) => {
  if (!isOpen) return null;

  const activityTemplate = getActivityTemplate(activity.activityTemplateId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-semibold">{activityTemplate?.name || 'Activity Details'}</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-md">
            <span className="sr-only">Close</span>
            <span className="text-xl">&times;</span>
          </Button>
        </div>
        <div className="p-4">
          <div className="grid gap-4 py-4">
            <div className="flex items-center space-x-2">
              <span className="text-gray-600"><Calendar /></span>
              <Label className="text-base">Date:</Label>
              <span className="text-base font-medium">{format(parseISO(activity.date), 'PPP')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600"><Clock /></span>
              <Label className="text-base">Time:</Label>
              <span className="text-base font-medium">{activity.startTime} - {activity.endTime}</span>
            </div>
            {activity.notes && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">Notes:</Label>
                <span id="notes" className="col-span-3">{activity.notes}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-between p-4 border-t">
          <div className="flex space-x-2 ml-auto">
            <Button variant="outline" onClick={() => handleEditActivity(activity)} className="rounded-md gap-1">
              <Pencil className="h-4 w-4"/> Edit
            </Button>
            <Button variant="destructive" onClick={() => handleDeleteActivity(activity.id)} className="rounded-md gap-1">
              <Trash className="h-4 w-4"/> Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetailsModal;
