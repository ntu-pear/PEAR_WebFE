import { PlusCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TabsContent } from '../ui/tabs';
import DataTable from '../Table/DataTable';
import { mockVitalCheck, VitalCheckTD } from '@/mocks/mockPatientDetails';
import TabProps from './types';
import { useEffect, useState } from 'react';
import { fetchVitalTD } from '@/api/patients/vitals';
import AddVitalModal from '../Modal/AddVitalModal';
import { useModal } from '@/hooks/useModal';
import DeleteVitalModal from '../Modal/DeleteVitalModal';

const VitalTab: React.FC<TabProps> = ({ id }) => {
  const [vitalCheck, setVitalCheck] = useState<VitalCheckTD[]>([]);
  const { activeModal, openModal } = useModal();

  const handleFetchVitalCheck = async () => {
    if (!id || isNaN(Number(id))) return;
    try {
      const fetchedVitalCheck: VitalCheckTD[] =
        import.meta.env.MODE === 'development' ||
        import.meta.env.MODE === 'production'
          ? await fetchVitalTD(Number(id))
          : mockVitalCheck;

      console.log('Fetched Patient Vital Check', fetchedVitalCheck); // Debug Log
      setVitalCheck(fetchedVitalCheck);
    } catch (error) {
      console.error('Error fetching patient vitals:', error);
    }
  };

  useEffect(() => {
    console.log(id);
    handleFetchVitalCheck();
  }, []);

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
                onClick={() =>
                  openModal('addVital', { patientId: id, submitterId: '1' })
                }
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
              data={vitalCheck}
              columns={vitalCheckColumns}
              viewMore={false}
              renderActions={(item) => (
                <div className="flex space-x-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="mt-3"
                    onClick={() =>
                      openModal('deleteVital', { vitalId: item.id })
                    }
                  >
                    Delete
                  </Button>
                </div>
              )}
            />
          </CardContent>
        </Card>
      </TabsContent>
      {activeModal.name === 'addVital' && <AddVitalModal />}

      {activeModal.name === 'deleteVital' && <DeleteVitalModal />}
    </>
  );
};

export default VitalTab;
