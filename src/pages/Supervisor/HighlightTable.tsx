import React, { useCallback, useEffect, useState } from 'react';
import { ListFilter } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Searchbar from '@/components/Searchbar';
import { DataTableClient } from '@/components/Table/DataTable';

import useDebounce from '@/hooks/useDebounce';
import {
  fetchHighlights,
  fetchHighlightTypes,
  HighlightTableData,
  HighlightTypeList,
} from '@/api/patients/highlight';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockCaregiverNameList } from '@/mocks/mockHighlightTableData';

const HighlightTable: React.FC = () => {
  const [highlights, setHighlights] = useState<HighlightTableData[]>([]);
  const [highlightTypes, setHighlightTypes] = useState<HighlightTypeList[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCaregiver, setSelectedCaregiver] = useState<string>('All');

  const [searchItem, setSearchItem] = useState('');
  const debouncedSearch = useDebounce(searchItem, 300);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearchItem(e.target.value),
    []
  );

  const sortByPatientName = (
    data: HighlightTableData[],
    direction: 'asc' | 'desc'
  ) => {
    return [...data].sort((a, b) => {
      if (a.patientName < b.patientName) return direction === 'asc' ? -1 : 1;
      if (a.patientName > b.patientName) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const handleFilter = async () => {
    try {
      const highlights = await fetchHighlights();

      let filteredHighlights = highlights.filter(({ patientName }) =>
        patientName.toLowerCase().includes(searchItem.toLowerCase())
      );

      filteredHighlights = filteredHighlights.filter(({ highlights }) =>
        highlights.some((highlight) =>
          highlight.some(({ type }) => selectedTypes.includes(type))
        )
      );

      filteredHighlights = filteredHighlights.filter(
        ({ caregiverId }) =>
          selectedCaregiver === 'All' ||
          caregiverId.toString() === selectedCaregiver
      );

      filteredHighlights = sortByPatientName(filteredHighlights, 'asc');

      setHighlights(filteredHighlights);
    } catch (error) {
      console.error('Error fetching highlights:', error);
    }
  };

  const formatHighlightType = (highlightType: string) => {
    switch (highlightType) {
      case 'newPrescription':
        return 'Prescription';
      case 'newAllergy':
        return 'Allergy';
      case 'newActivityExclusion':
        return 'Activity Exclusion';
      case 'abnormalVital':
        return 'Abnormal Vital';
      case 'problem':
        return 'Problem';
      case 'medicalHistory':
        return 'Medical History';
    }
  };

  useEffect(() => {
    fetchHighlightTypes()
      .then((highlightTypes) => {
        setHighlightTypes(highlightTypes);
        setSelectedTypes(highlightTypes.map(({ value }) => value));
      })
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    handleFilter();
  }, [selectedTypes, selectedCaregiver, debouncedSearch]);

  const tableColumns = [
    {
      key: 'patientName',
      header: 'Patient',
      render: (value: string, highlight: HighlightTableData) => (
        <div className='flex items-center gap-3'>
          <Avatar>
            <AvatarImage
              src={highlight.patientProfilePicture}
              alt={highlight.patientName}
            />
            <AvatarFallback>
              {highlight.patientName
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className='font-medium'>{value}</div>
            <div className='text-sm text-muted-foreground'>
              {highlight.patientNric}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'caregiverName',
      header: 'Caregiver',
      render: (value: string, highlight: HighlightTableData) => (
        <div className='flex items-center gap-3'>
          <Avatar>
            <AvatarImage
              src={highlight.caregiverProfilePicture}
              alt={highlight.caregiverName}
            />
            <AvatarFallback>
              {highlight.caregiverName
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className='font-medium'>{value}</div>
            <div className='text-sm text-muted-foreground'>
              {highlight.caregiverNric}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'highlights',
      header: 'Highlight',
      render: (
        value: {
          id: string;
          type: string;
          value: string;
        }[][]
      ) => (
        <div className='space-y-4'>
          {value.map((highlights) => (
            <div key={highlights[0].type}>
              <label className='font-semibold text-gray-700'>
                {formatHighlightType(highlights[0].type)}
              </label>
              <ul className='list-disc list-inside space-y-1'>
                {highlights.map((highlight, index) => (
                  <li key={index}>
                    <a href='#' className='text-blue-500 hover:underline'>
                      {highlight.value}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className='flex min-h-screen w-full flex-col container mx-auto px-0 sm:px-4'>
      <div className='flex flex-col sm:gap-4 sm:py-6'>
        <div className='flex'>
          <Searchbar
            searchItem={searchItem}
            onSearchChange={handleInputChange}
          />
          <div className='flex items-center gap-2 ml-auto'>
            <div className='flex'>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' size='sm' className='h-8 gap-1'>
                    <ListFilter className='h-4 w-4' />
                    <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>
                      Category
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  {highlightTypes.map(({ value }) => (
                    <DropdownMenuCheckboxItem
                      checked={selectedTypes.includes(value)}
                      onCheckedChange={(checked: boolean) => {
                        if (checked)
                          setSelectedTypes((prev) => [...prev, value]);
                        else
                          setSelectedTypes((prev) =>
                            prev.filter((item) => item !== value)
                          );
                      }}
                    >
                      {formatHighlightType(value)}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className='flex'>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' size='sm' className='h-8 gap-1'>
                    <ListFilter className='h-4 w-4' />
                    <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>
                      Caregiver
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuRadioGroup
                    value={selectedCaregiver}
                    onValueChange={setSelectedCaregiver}
                  >
                    <DropdownMenuRadioItem value='All'>
                      All
                    </DropdownMenuRadioItem>
                    {mockCaregiverNameList.map(({ id, name }) => (
                      <DropdownMenuRadioItem value={id.toString()}>
                        {name}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        <Card className='ml-4 sm:ml-6 px-4 py-2'>
          <CardHeader>
            <CardTitle>Patient Highlights</CardTitle>
            <CardDescription>
              View recent changes to patient's information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTableClient
              data={highlights}
              columns={tableColumns}
              viewMore={false}
              hideActionsHeader={true}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HighlightTable;
