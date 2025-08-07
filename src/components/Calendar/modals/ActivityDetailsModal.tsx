import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { format, parseISO } from 'date-fns';
import { ScheduledPatientActivity, ScheduledCentreActivity, ActivityTemplate, Patient } from '@/api/activity/activity';
import { useAuth } from '@/hooks/useAuth';

interface ActivityDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: ScheduledPatientActivity | ScheduledCentreActivity;
  getActivityTemplate: (id: string) => ActivityTemplate | undefined;
  getPatient: (id: string) => Patient | undefined;
  handleCreateExclusionFromActivity: (activity: ScheduledPatientActivity | ScheduledCentreActivity) => void;
  handleEditActivity: (activity: ScheduledPatientActivity | ScheduledCentreActivity) => void;
  handleDeleteActivity: (activityId: string) => void;
}

const ActivityDetailsModal: React.FC<ActivityDetailsModalProps> = ({
  isOpen,
  onClose,
  activity,
  getActivityTemplate,
  getPatient,
  handleCreateExclusionFromActivity,
  handleEditActivity,
  handleDeleteActivity,
}) => {
  if (!isOpen) return null;

  const { currentUser } = useAuth();
  const isSupervisor = currentUser?.roleName === 'SUPERVISOR';
  const activityTemplate = getActivityTemplate(activity.activityTemplateId);
  
  // Check if this is a patient activity (has patientId) or centre activity
  const isPatientActivity = 'patientId' in activity;
  const patient = isPatientActivity ? getPatient(activity.patientId) : null;

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
            {/* Patient info - only show for patient activities */}
            {isPatientActivity && patient && (
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">👥</span>
                <Label className="text-base">Patient:</Label>
                <span className="text-base font-medium">{patient.name}</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">📅</span>
              <Label className="text-base">Date:</Label>
              <span className="text-base font-medium">{format(parseISO(activity.date), 'PPP')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">⏰</span>
              <Label className="text-base">Time:</Label>
              <span className="text-base font-medium">{activity.startTime} - {activity.endTime}</span>
            </div>
            {/* Override status - only for patient activities */}
            {isPatientActivity && activity.isOverridden && (
              <div className="flex items-center space-x-2 text-purple-600">
                <span className="text-purple-600">ℹ️</span>
                <Label className="text-base">Status:</Label>
                <span className="text-base font-medium">Supervisor Overridden</span>
              </div>
            )}
            {/* Exclusion status - only for patient activities */}
            {isPatientActivity && activity.isExcluded && (
              <div className="flex items-center space-x-2 text-red-600">
                <span className="text-red-600">🚫</span>
                <Label className="text-base">Status:</Label>
                <span className="text-base font-medium">Excluded</span>
              </div>
            )}
            {/* Exclusion reason - only for patient activities */}
            {isPatientActivity && activity.exclusionReason && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="exclusionReason" className="text-right">Exclusion Reason:</Label>
                <span id="exclusionReason" className="col-span-3">{activity.exclusionReason}</span>
              </div>
            )}
            {activity.notes && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">Notes:</Label>
                <span id="notes" className="col-span-3">{activity.notes}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-between p-4 border-t">
          {/* Only show Create Exclusion for caregivers and patient activities */}
          {!isSupervisor && isPatientActivity && (
            <Button variant="outline" onClick={() => handleCreateExclusionFromActivity(activity)} className="rounded-md">
              🚫 Create Exclusion
            </Button>
          )}
          <div className={`flex space-x-2 ${!isSupervisor && isPatientActivity ? '' : 'ml-auto'}`}>
            <Button variant="outline" onClick={() => handleEditActivity(activity)} className="rounded-md">
              ✏️ Edit
            </Button>
            <Button variant="destructive" onClick={() => handleDeleteActivity(activity.id)} className="rounded-md">
              🗑️ Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetailsModal;
