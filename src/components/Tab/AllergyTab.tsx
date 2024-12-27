import { PlusCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TabsContent } from '../ui/tabs';
import DataTable from '../Table/DataTable';
import { mockAllergy } from '@/mocks/mockPatientDetails';
import TabProps from './types';

const AllergyTab: React.FC<TabProps> = ({ openModal }) => {
  const allergyColumns = [
    { key: 'allergicTo', header: 'Allergic To' },
    { key: 'reaction', header: 'Reaction' },
    { key: 'notes', header: 'Notes' },
  ];

  return (
    <>
      <TabsContent value="allergy">
        <Card className="my-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Allergy</span>
              <Button
                size="sm"
                className="h-8 w-24 gap-1"
                onClick={() => openModal('addAllergy')}
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
              data={mockAllergy}
              columns={allergyColumns}
              viewMore={false}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );
};

export default AllergyTab;
