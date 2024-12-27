import { PlusCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TabsContent } from '../ui/tabs';
import DataTable from '../Table/DataTable';
import { mockProblemLog } from '@/mocks/mockPatientDetails';
import TabProps from './types';

const ProblemLogTab: React.FC<TabProps> = ({ openModal }) => {
  const problemLogColumns = [
    { key: 'author', header: 'Author' },
    { key: 'description', header: 'Description' },
    { key: 'remark', header: 'Remark' },
  ];

  return (
    <>
      <TabsContent value="problem-log">
        <Card className="my-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Problem Log</span>
              <Button
                size="sm"
                className="h-8 w-24 gap-1"
                onClick={() => openModal('addProblem')}
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
              data={mockProblemLog}
              columns={problemLogColumns}
              viewMore={false}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );
};

export default ProblemLogTab;
