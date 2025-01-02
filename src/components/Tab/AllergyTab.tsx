import { PlusCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TabsContent } from '../ui/tabs';
import DataTable from '../Table/DataTable';
import { AllergyTD, mockAllergy } from '@/mocks/mockPatientDetails';
import TabProps from './types';
import { useEffect, useState } from 'react';
import { useModal } from '@/hooks/useModal';
import AddAllergyModal from '../Modal/AddAllergyModal';

const AllergyTab: React.FC<TabProps> = ({ id }) => {
  const [allergy, setAllergy] = useState<AllergyTD[]>([]);
  const { activeModal, openModal } = useModal();

  const handleFetchAllergy = async () => {
    if (!id || isNaN(Number(id))) return;
    try {
      const fetchedAllergy: AllergyTD[] =
        import.meta.env.MODE === 'development' ||
        import.meta.env.MODE === 'production'
          ? mockAllergy
          : mockAllergy;

      console.log('Fetched Patient Allergy', fetchedAllergy); // Debug Log
      setAllergy(fetchedAllergy);
    } catch (error) {
      console.error('Error fetching patient allergy:', error);
    }
  };

  useEffect(() => {
    console.log(id);
    handleFetchAllergy();
  }, []);

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
              data={allergy}
              columns={allergyColumns}
              viewMore={false}
            />
          </CardContent>
        </Card>
      </TabsContent>
      {activeModal.name === 'addAllergy' && <AddAllergyModal />}
    </>
  );
};

export default AllergyTab;
