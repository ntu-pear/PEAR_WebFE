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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
        parsedHighlight: h.highlightJSON ? JSON.parse(h.highlightJSON) : null,
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

  // 🔧 FIX 1: make this defensive to avoid calling .replace on undefined/null
  const formatHighlightType = (highlightType?: string | null) => {
    if (!highlightType || typeof highlightType !== "string") return "-";
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
          // 🔧 FIX 2: guard value in case it's undefined
          <div className="font-medium">{formatHighlightType(value ?? "-")}</div>
        ) : (
          ""
        ),
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
        
          case "New Problem": {
            console.log("PROBLEM case hit");

            const f = parsed ?? {};
            if (!f || Object.keys(f).length === 0) return <span>-</span>;
            const problemName = f.problem_name ?? "";
            const diagnosisDate = f.date_of_diagnosis
              ? String(f.date_of_diagnosis).split("T")[0]
              : "";
            const sourceInfo = f.source_of_information ?? "";
            const remarks = f.problem_remarks ?? "";
            detailsContent = (
              <div className="space-y-1 text-sm">
                <div><b>Description:</b> {problemName}</div>
                {diagnosisDate && <div><b>Date of diagnosis:</b> {diagnosisDate}</div>}
                {sourceInfo && <div><b>Source of information:</b> {sourceInfo}</div>}
                <div><b>Remarks:</b> {remarks || "-"}</div>
              </div>
            );
            console.log("Final detailsContent:", detailsContent)
            break;
          }
          
          
          case "New Allergy": {
            // Fields for allergy live under `additional_fields`
            // Remarks live OUTSIDE, on the root object as `source_remarks`

            
            const f = (parsed as any)?.additional_fields ?? (parsed as any) ?? {};

            const allergyType = f.allergy_type ?? "-";
            const reactionType = f.allergy_reaction_type ?? "-";
            const remarks = highlight.sourceRemarks ?? "-"; 
            
            detailsContent = (
              <div className="space-y-1 text-sm">
                <div><b>Allergy:</b> {allergyType}</div>
                <div><b>Reaction:</b> {reactionType}</div>
                <div><b>Remarks:</b> {remarks}</div>
              </div>
            );
            break;
          }


          case "New Medication": {
            // Same nesting safety
            const f = (parsed as any)?.additional_fields ?? (parsed as any) ?? {};
            const remarks = highlight.sourceRemarks ?? "-"; 

            const name = f.prescription_name ?? "-";
            const dosage = f.dosage ?? "-";
            const instruction = f.instruction ?? "-";

            // Format "1900" -> "19:00"
            const administerTimeRaw = f.administer_time ? String(f.administer_time) : "";
            const administerTime =
              administerTimeRaw && administerTimeRaw.length >= 3
                ? `${administerTimeRaw.slice(0, 2)}:${administerTimeRaw.slice(2)}`
                : administerTimeRaw || "-";

            const startDate = f.start_date ? String(f.start_date).split("T")[0] : "-";
            const endDate = f.end_date ? String(f.end_date).split("T")[0] : "-";

            detailsContent = (
              <div className="space-y-1 text-sm">
                <div><b>Medication:</b> {name}</div>
                <div><b>Dosage:</b> {dosage}</div>
                <div><b>Instruction:</b> {instruction}</div>
                <div><b>Administer time:</b> {administerTime}</div>
                <div><b>Start date:</b> {startDate}</div>
                <div><b>End date:</b> {endDate}</div>
                <div><b>Remarks:</b> {remarks}</div>
              </div>
            );
            break;
          }
          case "New Prescription": {
            // Same nesting safety
            const f = (parsed as any)?.additional_fields ?? (parsed as any) ?? {};
            const remarks = highlight.sourceRemarks ?? "-"; 

            const name = f.prescription_name ?? "-";
            const dosage = f.dosage ?? "-";
            const frequency= f.frequency_per_day ?? "-";
            const instruction = f.instruction ?? "-";

            const is_after_meal_int = f.is_after_meal ?? "0"
            const is_after_meal_bool = is_after_meal_int == 0 ? "No" : "Yes";

            const startDate = f.start_date ? String(f.start_date).split("T")[0] : "-";
            const endDate = f.end_date ? String(f.end_date).split("T")[0] : "-";

            detailsContent = (
              <div className="space-y-1 text-sm">
                <div><b>Medication:</b> {name}</div>
                <div><b>Dosage:</b> {dosage}</div>
                <div><b>Frequency:</b> {frequency} <b>per day</b></div>
                <div><b>Instruction:</b> {instruction}</div>
                <div><b>To be taken after meals:</b> {is_after_meal_bool}</div>
                <div><b>Start date:</b> {startDate}</div>
                <div><b>End date:</b> {endDate}</div>
                <div><b>Remarks:</b> {remarks}</div>
              </div>
            );
            break;
          }
          case "Vital Signs Alert": {
            const f = (parsed as any)?.additional_fields ?? (parsed as any) ?? {};
            const fields = f.additional_fields ?? {};

            const temperature = f.temperature ?? "-";
            const systolicBP = f.systolic_bp ?? "-";
            const diastolicBP = f.diastolic_bp ?? "-";
            const heartRate = f.heart_rate ?? "-";
            const spo2 = f.spo2 ?? "-";
            const bloodSugar = f.blood_sugar_level ?? "-";

            const baseline = f.default_baselines ?? {};
            const baselineTemp = baseline.temperature ?? "-";
            const baselineSystolic = baseline.systolic_bp ?? baseline.systolicBP ?? "-";
            const baselineDiastolic = baseline.diastolic_bp ?? baseline.diastolicBP ?? "-";
            const baselineHR = baseline.heart_rate ?? baseline.heartRate ?? "-";
            const baselineSpo2 = baseline.spo2 ?? "-";
            const baselineBloodSugar = baseline.blood_sugar ?? baseline.bloodSugar ?? "-";

            const remarks = highlight.sourceRemarks ?? "-"; 

            detailsContent = (
              <div className="space-y-1 text-sm">
                <div>
                  <b>Temperature (°C):</b> {temperature} (Normal: {baselineTemp})
                </div>
                <div>
                  <b>BP (mmHg):</b> {systolicBP}/{diastolicBP} (Normal: {baselineSystolic}/{baselineDiastolic})
                </div>
                <div>
                  <b>Heart Rate (bpm):</b> {heartRate} (Normal: {baselineHR})
                </div>
                <div>
                  <b>SpO₂ (%):</b> {spo2} (Normal: {baselineSpo2})
                </div>
                <div>
                  <b>Blood Sugar Level (mmol/L):</b> {bloodSugar} (Normal: {baselineBloodSugar})
                </div>
                <div>
                  <b>Vital Remarks:</b> {remarks}
                </div>
              </div>
            );
            break;
          }

          default:
            return <span>-</span>;
        }

        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 text-sm font-medium"
              >
                View Details
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3">
              {detailsContent}
            </PopoverContent>
          </Popover>
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
                      // 🔧 FIX 3: add key (minimal & safe)
                      <DropdownMenuCheckboxItem
                        key={TypeName}
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
                        <DropdownMenuRadioItem key={id} value={id.toString()}>
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