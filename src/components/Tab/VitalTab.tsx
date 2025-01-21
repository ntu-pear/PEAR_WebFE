import { PlusCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TabsContent } from '../ui/tabs';
import DataTable from '../Table/DataTable';
import { mockVitalCheck, VitalCheckTD } from '@/mocks/mockPatientDetails';
import TabProps from './types';
import { useEffect, useState } from 'react';
import { fetchVitals } from '@/api/patients/vital';
import AddVitalModal from '../Modal/AddVitalModal';
import { useModal } from '@/hooks/useModal';
import DeleteVitalModal from '../Modal/DeleteVitalModal';
import { toast } from 'sonner';
import EditVitalModal from '../Modal/EditVitalModal';

const VitalTab: React.FC<TabProps> = ({ id }) => {
  const [vitalCheck, setVitalCheck] = useState<VitalCheckTD[]>([]);
  const { activeModal, openModal } = useModal();

  const handleFetchVitalCheck = async () => {
    if (!id || isNaN(Number(id))) return;
    try {
      const fetchedVitalCheck: VitalCheckTD[] =
        import.meta.env.MODE === 'development' ||
        import.meta.env.MODE === 'production'
          ? await fetchVitals(Number(id))
          : mockVitalCheck;

      setVitalCheck(fetchedVitalCheck);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Failed to fetch vital for patient');
    }
  };

  useEffect(() => {
    console.log('patientId', id);
    handleFetchVitalCheck();
  }, []);

  const refreshVitalData = () => {
    handleFetchVitalCheck();
  };

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
                  openModal('addVital', {
                    patientId: id,
                    submitterId: '1',
                    refreshVitalData,
                  })
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
                    size="sm"
                    className="mt-3"
                    onClick={() =>
                      openModal('editVital', {
                        vitalId: String(item.id),
                        vitalData: item,
                        patientId: String(id),
                        submitterId: '1',
                        refreshVitalData,
                      })
                    }
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="mt-3"
                    onClick={() =>
                      openModal('deleteVital', {
                        vitalId: String(item.id),
                        refreshVitalData,
                      })
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
      {activeModal.name === 'editVital' && <EditVitalModal />}
      {activeModal.name === 'deleteVital' && <DeleteVitalModal />}
    </>
  );
};

export default VitalTab;
