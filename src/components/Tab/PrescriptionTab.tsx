import { PlusCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TabsContent } from '../ui/tabs';
import DataTable from '../Table/DataTable';
import { mockPrescription, PrescriptionTD } from '@/mocks/mockPatientDetails';
import TabProps from './types';
import { useModal } from '@/hooks/useModal';
import AddPrescriptionModal from '../Modal/AddPrescriptionModal';
import { fetchPatientPrescription } from '@/api/patients/prescription';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import DeletePrescriptionModal from '../Modal/DeletePrescriptionModal';

const PrescriptionTab: React.FC<TabProps> = ({ id }) => {
  const { activeModal, openModal } = useModal();
  const [prescription, setPrescription] = useState<PrescriptionTD[]>([]);

  const handleFetchPrescription = async () => {
    if (!id || isNaN(Number(id))) return;

    try {
      const fetchedPrescription: PrescriptionTD[] =
        import.meta.env.MODE === 'development' ||
        import.meta.env.MODE === 'production'
          ? await fetchPatientPrescription(Number(id))
          : mockPrescription;

      setPrescription(fetchedPrescription);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Failed to fetch prescription for patient');
    }
  };

  useEffect(() => {
    console.log('patientId', id);

    handleFetchPrescription();
  }, []);

  const refreshPrescriptionData = () => {
    handleFetchPrescription();
  };

  const prescriptionColumns = [
    { key: 'drugName', header: 'Drug Name' },
    { key: 'dosage', header: 'Dosage' },
    { key: 'frequencyPerDay', header: 'Frequency Per Day' },
    { key: 'instruction', header: 'Instruction' },
    { key: 'startDate', header: 'Start Date' },
    { key: 'endDate', header: 'End Date' },
    { key: 'afterMeal', header: 'After Meal' },
    { key: 'remark', header: 'Remark' },
    { key: 'status', header: 'Status' },
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
                onClick={() =>
                  openModal('addPrescription', {
                    patientId: id,
                    submitterId: '1',
                    refreshPrescriptionData,
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
              data={prescription}
              columns={prescriptionColumns}
              viewMore={false}
              renderActions={(item) => (                
                <div className="flex space-x-2">
                  <Button variant="default"
                    size="sm"
                    className="mt-3"
                    onClick={() => {
                      openModal('editPrescription', {
                        prescriptionId: String(item.id),
                        submitterId: '1',
                        refreshPrescriptionData,
                      })
                    }
                      
                    }
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="mt-3"
                    onClick={() =>
                      openModal('deletePrescription', {
                        prescriptionId: String(item.id),
                        submitterId: '1',
                        refreshPrescriptionData,
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
      {activeModal.name === 'addPrescription' && <AddPrescriptionModal />}
      {activeModal.name === 'deletePrescription' && <DeletePrescriptionModal />}
    </>
  );
};

export default PrescriptionTab;
