import { PlusCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TabsContent } from '../ui/tabs';
import DataTable from '../Table/DataTable';
import { mockPrescription } from '@/mocks/mockPatientDetails';
import TabProps from './types';

const PrescriptionTab: React.FC<TabProps> = ({ openModal }) => {
  const prescriptionColumns = [
    { key: 'drugName', header: 'Drug Name' },
    { key: 'dosage', header: 'Dosage' },
    { key: 'frequencyPerDay', header: 'Frequency Per Day' },
    { key: 'instruction', header: 'Instruction' },
    { key: 'startDate', header: 'Start Date' },
    { key: 'endDate', header: 'End Date' },
    { key: 'afterMeal', header: 'After Meal' },
    { key: 'remark', header: 'Remark' },
    { key: 'chronic', header: 'Chronic' },
  ];

  return (
    <>
      <TabsContent value="prescription">
        <Card className="my-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Prescriptions</span>
              <Button
                size="sm"
                className="h-8 w-24 gap-1"
                onClick={() => openModal('addPrescription')}
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
              data={mockPrescription}
              columns={prescriptionColumns}
              viewMore={false}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );
};

export default PrescriptionTab;
