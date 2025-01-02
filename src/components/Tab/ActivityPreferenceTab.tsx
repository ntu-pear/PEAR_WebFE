import { PlusCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TabsContent } from '../ui/tabs';
import DataTable from '../Table/DataTable';
import { mockActivityPreferences } from '@/mocks/mockPatientDetails';
import TabProps from './types';
import { useModal } from '@/hooks/useModal';
import AddActivityPreferenceModal from '../Modal/AddActivityPreferenceModal';

const ActivityPreferenceTab: React.FC<TabProps> = () => {
  const { activeModal, openModal } = useModal();
  const activityPreferencesColumns = [
    { key: 'activityName', header: 'Activity Name' },
    { key: 'activityDescription', header: 'Activity Description' },
    { key: 'likeOrDislike', header: 'Like/Dislike' },
  ];

  return (
    <>
      <TabsContent value="activity-preference">
        <Card className="my-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Activity Preferences</span>
              <Button
                size="sm"
                className="h-8 w-24 gap-1"
                onClick={() => openModal('addActivityPreference')}
              >
                <PlusCircle className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add
                </span>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={mockActivityPreferences}
              columns={activityPreferencesColumns}
              viewMore={false}
            />
          </CardContent>
        </Card>
      </TabsContent>
      {activeModal.name == 'addActivityPreference' && (
        <AddActivityPreferenceModal />
      )}
    </>
  );
};

export default ActivityPreferenceTab;
