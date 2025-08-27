import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { format, parseISO } from 'date-fns';
import { ScheduledCentreActivity, ScheduledPatientActivity, ActivityTemplate } from '@/api/scheduler/scheduler';
import { Calendar, Clock, Ban, Activity, User } from 'lucide-react';

interface ActivityDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: ScheduledCentreActivity | ScheduledPatientActivity;
  getActivityTemplate: (id: string) => ActivityTemplate | undefined;
  getPatientDisplayName?: (patientId: number) => string;
}

const ActivityDetailsModal: React.FC<ActivityDetailsModalProps> = ({
  isOpen,
  onClose,
  activity,
  getActivityTemplate,
  getPatientDisplayName,
}) => {
  const navigate = useNavigate();
  
  if (!isOpen) return null;

  const activityTemplate = getActivityTemplate(activity.activityTemplateId);
  
  // Check if this is a patient activity (has patientId)
  const isPatientActivity = 'patientId' in activity;
  const patientId = isPatientActivity ? (activity as ScheduledPatientActivity).patientId : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-semibold">Activity Details</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-md">
            <span className="sr-only">Close</span>
            <span className="text-xl">&times;</span>
          </Button>
        </div>
        <div className="p-4">
          <div className="grid gap-4 py-4">
            {/* Activity Name */}
            <div className="flex items-center space-x-2">
              <span className="text-gray-600"><Activity /></span>
              <Label className="text-base font-semibold">Activity:</Label>
              <span className="text-base font-medium">{activityTemplate?.name || 'Unknown Activity'}</span>
            </div>
            
            {/* Patient Name - only show for patient activities */}
            {isPatientActivity && patientId && (
              <div className="flex items-center space-x-2">
                <span className="text-gray-600"><User /></span>
                <Label className="text-base">Patient:</Label>
                <span className="text-base font-medium">
                  {getPatientDisplayName ? getPatientDisplayName(parseInt(patientId)) : `Patient ID: ${patientId}`}
                </span>
              </div>
            )}
            
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
            {isPatientActivity && patientId && (
              <Button 
                variant="outline" 
                onClick={() => navigate(`/supervisor/view-patient/${patientId}?tab=activity-exclusion`)} 
                className="rounded-md gap-1"
              >
                <Ban className="h-4 w-4"/> Add Exclusion
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetailsModal;
