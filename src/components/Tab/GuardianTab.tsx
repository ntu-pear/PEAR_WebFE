import { PlusCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TabsContent } from '../ui/tabs';
import DataTable from '../Table/DataTable';
import { GuardianTD, mockGuardian } from '@/mocks/mockPatientDetails';
import TabProps from './types';
import { useEffect, useState } from 'react';

import { useModal } from '@/hooks/useModal';
import AddGuardianModal from '../Modal/AddGuardianModal';
import { toast } from 'sonner';

const GuardianTab: React.FC<TabProps> = ({ id }) => {
  const [guardian, setGuardian] = useState<GuardianTD[]>([]);
  const { activeModal, openModal } = useModal();

  const handleFetchGuardianTD = async () => {
    if (!id || isNaN(Number(id))) return;
    try {
      const fetchedGuardianTD: GuardianTD[] =
        import.meta.env.MODE === 'development' ||
        import.meta.env.MODE === 'production'
          ? mockGuardian
          : mockGuardian;

      setGuardian(fetchedGuardianTD);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Failed to fetch guardian for patient');
    }
  };

  useEffect(() => {
    console.log('patientId', id);
    handleFetchGuardianTD();
  }, []);

  const guardianColumns = [
    { key: 'guardianType', header: 'Guardian Type' },
    { key: 'guardianName', header: 'Guardian Name' },
    { key: 'preferredName', header: 'Preferred Name' },
    { key: 'nric', header: 'NRIC' },
    { key: 'relationshipWithPatient', header: "Patient's" },
    { key: 'contractNo', header: 'Contact Number' },
    { key: 'address', header: 'Address' },
    { key: 'email', header: 'Email' },
  ];

  return (
    <>
      <TabsContent value="guardian">
        <Card className="my-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Guardian</span>
              <Button
                size="sm"
                className="h-8 w-24 gap-1"
                onClick={() => openModal('addGuardian')}
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
              data={guardian}
              columns={guardianColumns}
              viewMore={false}
            />
          </CardContent>
        </Card>
      </TabsContent>
      {activeModal.name === 'addGuardian' && <AddGuardianModal />}
    </>
  );
};

export default GuardianTab;
