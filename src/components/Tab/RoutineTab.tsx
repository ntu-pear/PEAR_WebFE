import { PlusCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TabsContent } from '../ui/tabs';
import { DataTableClient } from '../Table/DataTable';
import { mockRoutine } from '@/mocks/mockPatientDetails';
import TabProps from './types';
import { useModal } from '@/hooks/useModal';
import AddRoutineModal from '../Modal/AddRoutineModal';

const RoutineTab: React.FC<TabProps> = () => {
  const { activeModal, openModal } = useModal();
  const routineColumns = [
    { key: 'activityName', header: 'Activity Name' },
    { key: 'routineIssue', header: 'Routine Issue' },
    { key: 'routineTimeSlots', header: 'Routine Time Slots' },
    { key: 'includeInSchedule', header: 'Include in Schedule' },
  ];

  return (
    <>
      <TabsContent value="routine">
        <Card className="my-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Routine</span>
              <Button
                size="sm"
                className="h-8 w-24 gap-1"
                onClick={() => openModal('addRoutine')}
              >
                <PlusCircle className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add
                </span>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTableClient
              data={mockRoutine}
              columns={routineColumns}
              viewMore={false}
            />
          </CardContent>
        </Card>
      </TabsContent>
      {activeModal.name == 'addRoutine' && <AddRoutineModal />}
    </>
  );
};

export default RoutineTab;
