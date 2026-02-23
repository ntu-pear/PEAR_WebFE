import React, { useCallback, useEffect, useState, ReactNode, PropsWithChildren } from "react";
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
  HighlightType,
} from "@/api/patients/highlight";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { mockCaregiverNameList } from "@/mocks/mockHighlightTableData";

const HighlightTable: React.FC = () => {
  const [highlights, setHighlights] = useState<HighlightTableData[]>([]);
  const [highlightTypes, setHighlightTypes] = useState<HighlightType[]>([]);
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
      console.log("All Fetched highlights array:", highlights); 


      const parsedHighlights = highlights.map((h) => ({
      ...h,
      parsedHighlight: h.highlightJSON? JSON.parse(h.highlightJSON): null,
      }));
      console.log("After parsing:", parsedHighlights); 

      let filteredHighlights = parsedHighlights.filter(({ patientName }) =>
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
      console.log("After filtering:", filteredHighlights); 

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
        setSelectedTypes(highlightTypes.map(({ TypeName }) => TypeName));
      })
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    handleFilter();
  }, [selectedTypes, selectedCaregiver, debouncedSearch]);

  // Tooltip component for hover Highlights
  interface TooltipProps {
    content: ReactNode;
  }

  // Add PropsWithChildren to allow children
  const Tooltip: React.FC<PropsWithChildren<TooltipProps>> = ({ children, content }) => {
    return (
      <div className="relative group inline-block">
        {children}
        <div className="absolute z-10 hidden group-hover:block w-72 p-2 bg-gray-800 text-white text-sm rounded shadow-lg">
          {content}
        </div>
      </div>
    );
  };

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
        console.log("Rendering highlight:", highlight); // 🔥 log the entire highlight object
        const parsed = highlight.parsedHighlight;

        if (!parsed) {
          console.log("parsedHighlight is null for this row", highlight.id);
          return <span>-</span>;
        }
        
        let detailsContent: React.ReactNode = null;

        switch (highlight.type) {
          case "Prescription": {
            const d = highlight.parsedHighlight?.Prescription;
            if (!d) {
              console.log("Prescription data is missing", highlight.id);
              return <span>-</span>;
            } 
            console.log("Prescription data:", d);

            detailsContent = (
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
            break;
          }
          case "Allergy": {
            const d = highlight.parsedHighlight?.Allergy;
            if (!d) {
              console.log("Allergy data is missing", highlight.id);
              return <span>-</span>;
            }
            console.log("Allergy data:", d);

            detailsContent = (
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
            break;
          }
          case "ActivityExclusion": {
            const d = highlight.parsedHighlight?.ActivityExclusion;
            if (!d) {
              console.log("ActivityExclusion data is missing", highlight.id);
              return <span>-</span>;
            }
            console.log("ActivityExclusion data:", d);

            detailsContent = (
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
            break;
          }
          case "Vital": {
            const d = highlight.parsedHighlight?.Vital;
            if (!d) {
              console.log("Vital data is missing", highlight.id);
              return <span>-</span>;
            }
            console.log("Vital data:", d);

            detailsContent = (
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
            break;
          }
          case "Problem": {
            const d = highlight.parsedHighlight?.Problem;
            if (!d) {
              console.log("Problem data is missing", highlight.id);
              return <span>-</span>;
            }
            console.log("Problem data:", d);

            detailsContent = (
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
            break;
          }

          default:
            return <span>-</span>;
        }

        return (
          <Tooltip content={detailsContent}>
            <button className="px-2 py-1 text-sm font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50">
              View Details
            </button>
          </Tooltip>
        );
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
                    {highlightTypes.map(({ TypeName }) => (
                      <DropdownMenuCheckboxItem
                        checked={selectedTypes.includes(TypeName)}
                        onCheckedChange={(checked: boolean) => {
                          if (checked)
                            setSelectedTypes((prev) => [...prev, TypeName]);
                          else
                            setSelectedTypes((prev) =>
                              prev.filter((item) => item !== TypeName)
                            );
                        }}
                      >
                        {formatHighlightType(TypeName)}
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
