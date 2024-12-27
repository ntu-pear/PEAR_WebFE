import { PlusCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TabsContent } from '../ui/tabs';
import DataTable from '../Table/DataTable';
import { mockVitalCheck } from '@/mocks/mockPatientDetails';
import TabProps from './types';

const VitalTab: React.FC<TabProps> = ({ openModal }) => {
  const vitalCheckColumns = [
    { key: 'date', header: 'Date' },
    { key: 'time', header: 'Time' },
    { key: 'temperature', header: 'Temperature (°C)' },
    { key: 'weight', header: 'Weight (kg)' },
    { key: 'height', header: 'Height (m)' },
    { key: 'systolicBP', header: 'Systolic BP (mmHg)' },
    { key: 'diastolicBP', header: 'Diastolic BP (mmHg)' },
    { key: 'heartRate', header: 'Heart Rate (bpm)' },
    { key: 'spO2', header: 'SpO2 (%)' },
    { key: 'bloodSugarLevel', header: 'Blood Sugar Level (mmol/L)' },
    { key: 'afterMeal', header: 'After Meal' },
    { key: 'remark', header: 'Remark' },
  ];

  return (
    <>
      <TabsContent value="vital">
        <Card className="my-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Vital Checks</span>
              <Button
                size="sm"
                className="h-8 w-24 gap-1"
                onClick={() => openModal('addVital')}
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
              data={mockVitalCheck}
              columns={vitalCheckColumns}
              viewMore={false}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );
};

export default VitalTab;
