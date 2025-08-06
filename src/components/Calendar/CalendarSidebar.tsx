import React from 'react';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ActivityExclusion, ActivityTemplate, Patient } from '@/api/activity/activity';

interface CalendarSidebarProps {
  patientsData: Patient[];
  activityTemplates: ActivityTemplate[];
  activityExclusions: ActivityExclusion[];
  selectedPatients: string[];
  selectedActivities: string[];
  getPatient: (id: string) => Patient | undefined;
  getActivityTemplate: (id: string) => ActivityTemplate | undefined;
  onPatientToggle: (patientId: string, checked: boolean) => void;
  onActivityToggle: (activityId: string, checked: boolean) => void;
  onEditExclusion: (exclusion: ActivityExclusion) => void;
  onDeleteExclusion: (exclusionId: string) => void;
  onManageExclusions: () => void;
}

const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
  patientsData,
  activityTemplates,
  activityExclusions,
  selectedPatients,
  selectedActivities,
  getPatient,
  getActivityTemplate,
  onPatientToggle,
  onActivityToggle,
  onEditExclusion,
  onDeleteExclusion,
  onManageExclusions,
}) => {
  return (
    <aside className="w-64 p-4 bg-white border-r overflow-y-auto">
      <div className="h-full pr-4">
        {/* Patients Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 flex items-center">👥 Patients</h3>
          <div className="space-y-2">
            {patientsData.map(patient => (
              <div key={patient.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`patient-${patient.id}`}
                  checked={selectedPatients.includes(patient.id)}
                  onChange={(e) => onPatientToggle(patient.id, e.target.checked)}
                  disabled={!patient.isActive}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor={`patient-${patient.id}`} className={`cursor-pointer ${!patient.isActive ? 'text-gray-400' : ''}`}>
                  {patient.name} {patient.isActive ? '' : '(Inactive)'}
                </Label>
              </div>
            ))}
          </div>
          <Button 
            variant="link" 
            className="mt-2 p-0 h-auto text-sm" 
            onClick={() => console.log('Navigate to Manage Patients')}
          >
            Manage Patients
          </Button>
        </div>

        {/* Activities Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 flex items-center">🏃 Activities</h3>
          <div className="space-y-2">
            {activityTemplates.map(activity => (
              <div key={activity.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`activity-${activity.id}`}
                  checked={selectedActivities.includes(activity.id)}
                  onChange={(e) => onActivityToggle(activity.id, e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor={`activity-${activity.id}`} className="cursor-pointer">
                  {activity.name} {activity.isRarelyScheduled && <span className="text-red-500 text-xs font-medium">(Rare)</span>}
                </Label>
              </div>
            ))}
          </div>
          <Button 
            variant="link" 
            className="mt-2 p-0 h-auto text-sm" 
            onClick={() => console.log('Navigate to Manage Activities')}
          >
            Manage Activities
          </Button>
        </div>

        {/* Exclusions Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 flex items-center">🚫 Exclusions</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            {activityExclusions.length > 0 ? (
              activityExclusions.map(exclusion => {
                const patient = getPatient(exclusion.patientId);
                const activity = getActivityTemplate(exclusion.activityTemplateId);
                return (
                  <li key={exclusion.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-md border border-gray-200">
                    <span>
                      <span className="font-medium">{patient?.name}</span> - {activity?.name}
                      <br />
                      <span className="text-xs">{format(parseISO(exclusion.startDate), 'MMM dd')} - {format(parseISO(exclusion.endDate), 'MMM dd')}</span>
                      {exclusion.reason && <span className="text-xs italic block mt-0.5">Reason: {exclusion.reason}</span>}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">⋮</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditExclusion(exclusion)}>
                          ✏️ Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDeleteExclusion(exclusion.id)}>
                          🗑️ Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                );
              })
            ) : (
              <p className="text-gray-500 italic">No active exclusions.</p>
            )}
          </ul>
          <Button 
            variant="link" 
            className="mt-2 p-0 h-auto text-sm" 
            onClick={onManageExclusions}
          >
            Manage Exclusions
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default CalendarSidebar;
