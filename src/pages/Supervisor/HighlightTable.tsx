import React, { useCallback, useEffect, useState } from "react";
import { ListFilter } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Searchbar from "@/components/Searchbar";
import { DataTableClient } from "@/components/Table/DataTable";

import useDebounce from "@/hooks/useDebounce";
import {
  fetchHighlights,
  fetchHighlightTypes,
  HighlightTableData,
  HighlightTypeList,
} from "@/api/patients/highlight";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  mockCaregiverNameList,
  mockHighlightDetails,
} from "@/mocks/mockHighlightTableData";

const HighlightTable: React.FC = () => {
  const [highlights, setHighlights] = useState<HighlightTableData[]>([]);
  const [highlightTypes, setHighlightTypes] = useState<HighlightTypeList[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCaregiver, setSelectedCaregiver] = useState<string>("All");
  const [searchItem, setSearchItem] = useState("");
  const debouncedSearch = useDebounce(searchItem, 300);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearchItem(e.target.value),
    []
  );

  const flattenHighlights = (
    highlights: HighlightTableData[]
  ): HighlightTableData[] => {
    let count = 0;

    while (count < highlights.length) {
      if (
        count % 10 === 0 ||
        highlights[count].patientId !== highlights[count - 1].patientId
      ) {
        highlights[count].showPatientDetails = true;
        highlights[count].showCaregiverDetails = true;
        highlights[count].showType = true;
      } else if (highlights[count].type !== highlights[count - 1].type) {
        highlights[count].showType = true;
      }

      count++;
    }

    return highlights;
  };

  const handleFilter = async () => {
    try {
      const highlights = await fetchHighlights();

      let filteredHighlights = highlights.filter(({ patientName }) =>
        patientName.toLowerCase().includes(searchItem.toLowerCase())
      );

      filteredHighlights = filteredHighlights.filter(({ type }) =>
        selectedTypes.includes(type)
      );

      filteredHighlights = filteredHighlights.filter(
        ({ caregiverId }) =>
          selectedCaregiver === "All" ||
          caregiverId.toString() === selectedCaregiver
      );

      setHighlights(flattenHighlights(filteredHighlights));
    } catch (error) {
      console.error("Error fetching highlights:", error);
    }
  };

  const formatHighlightType = (highlightType: string) => {
    const spaced = highlightType.replace(/([a-z])([A-Z])/g, "$1 $2");

    return spaced
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
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
      key: "patientName",
      header: "Patient",
      render: (value: string, highlight: HighlightTableData) =>
        highlight.showPatientDetails ? (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage
                src={highlight.patientProfilePicture}
                alt={highlight.patientName}
              />
              <AvatarFallback>
                {highlight.patientName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{value}</div>
              <div className="text-sm text-muted-foreground">
                {highlight.patientNric}
              </div>
            </div>
          </div>
        ) : (
          <div></div>
        ),
    },
    {
      key: "caregiverName",
      header: "Caregiver",
      render: (value: string, highlight: HighlightTableData) =>
        highlight.showCaregiverDetails ? (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage
                src={highlight.caregiverProfilePicture}
                alt={highlight.caregiverName}
              />
              <AvatarFallback>
                {highlight.caregiverName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{value}</div>
              <div className="text-sm text-muted-foreground">
                {highlight.caregiverNric}
              </div>
            </div>
          </div>
        ) : (
          <div></div>
        ),
    },
    {
      key: "type",
      header: "Type",
      render: (value: string, highlight: HighlightTableData) =>
        highlight.showType ? (
          <div className="font-medium">{formatHighlightType(value)}</div>
        ) : (
          ""
        ),
    },
    {
      key: "value",
      header: "Value",
      render: (value: string) => value,
    },
    {
      // TBD: Fix after highlight corresponds to correct highlight type ID
      key: "details",
      header: "Details",
      render: (_: string, highlight: HighlightTableData) => {
        switch (highlight.type) {
          case "Prescription": {
            const d = mockHighlightDetails.Prescription;
            return (
              <div className="space-y-1 text-sm">
                <div>
                  <b>Drug name:</b> {d.prescriptionListDesc}
                </div>
                <div>
                  <b>Dosage:</b> {d.dosage}
                </div>
                <div>
                  <b>Frequency per day:</b> {d.frequencyPerDay}
                </div>
                <div>
                  <b>Instruction:</b> {d.instruction}
                </div>
                <div>
                  <b>Take after meal:</b> {d.afterMeal ? "Yes" : "No"}
                </div>
                <div>
                  <b>Chronic:</b> {d.isChronic ? "Yes" : "No"}
                </div>
                <div>
                  <b>Start date:</b> {d.startDate.split("T")[0]}
                </div>
                <div>
                  <b>End date:</b> {d.endDate.split("T")[0]}
                </div>
                <div>
                  <b>Remarks:</b> {d.prescriptionRemarks}
                </div>
              </div>
            );
          }
          case "Allergy": {
            const d = mockHighlightDetails.Allergy;
            return (
              <div className="space-y-1 text-sm">
                <div>
                  <b>Allergy:</b> {d.allergyListDesc}
                </div>
                <div>
                  <b>Reaction:</b> {d.allergyReaction}
                </div>
                <div>
                  <b>Remarks:</b> {d.allergyRemarks}
                </div>
              </div>
            );
          }
          case "ActivityExclusion": {
            const d = mockHighlightDetails.ActivityExclusion;
            return (
              <div className="space-y-1 text-sm">
                <div>
                  <b>Activity name:</b> {d.activityTitle}
                </div>
                <div>
                  <b>Activity description:</b> {d.activityDesc}
                </div>
                <div>
                  <b>Start date:</b> {d.startDateTime.split("T")[0]}
                </div>
                <div>
                  <b>End date:</b> {d.endDateTime.split("T")[0]}
                </div>
                <div>
                  <b>Remarks:</b> {d.exclusionRemarks}
                </div>
              </div>
            );
          }
          case "Vital": {
            const d = mockHighlightDetails.Vital;
            return (
              <div className="space-y-1 text-sm">
                <div>
                  <b>Taken after meal:</b> {d.afterMeal ? "Yes" : "No"}
                </div>
                <div>
                  <b>Temperature (°C):</b> {d.temperature}
                </div>
                <div>
                  <b>SystolicBP/DiastolicBP (mmHg):</b> {d.systolicBP}/
                  {d.diastolicBP}
                </div>
                <div>
                  <b>HeartRate (bpm):</b> {d.heartRate}
                </div>
                <div>
                  <b>SpO₂ (%):</b> {d.spO2}
                </div>
                <div>
                  <b>Blood sugar level (mmol/L):</b> {d.bloodSugarlevel}
                </div>
                <div>
                  <b>Height (m):</b> {d.height}
                </div>
                <div>
                  <b>Weight (kg):</b> {d.weight}
                </div>
              </div>
            );
          }
          case "Problem": {
            const d = mockHighlightDetails.Problem;
            return (
              <div className="space-y-1 text-sm">
                <div>
                  <b>Description:</b> {d.problemLogListDesc}
                </div>
                <div>
                  <b>Remarks:</b> {d.problemLogRemarks}
                </div>
                <div>
                  <b>Author:</b> {d.authorName}
                </div>
              </div>
            );
          }
          default:
            return <span>-</span>;
        }
      },
    },
  ];

  return (
    <>
      <div className="flex min-h-screen w-full flex-col container mx-auto px-0 sm:px-4">
        <div className="flex flex-col sm:gap-4 sm:py-6">
          <div className="flex">
            <Searchbar
              searchItem={searchItem}
              onSearchChange={handleInputChange}
            />
            <div className="flex items-center gap-2 ml-auto">
              <div className="flex">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <ListFilter className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Category
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
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
              <div className="flex">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <ListFilter className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Caregiver
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuRadioGroup
                      value={selectedCaregiver}
                      onValueChange={setSelectedCaregiver}
                    >
                      <DropdownMenuRadioItem value="All">
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
          <Card className="ml-4 sm:ml-6 px-4 py-2">
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
    </>
  );
};

export default HighlightTable;
