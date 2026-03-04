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
import { ChevronDown } from "lucide-react";
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
import { formatDate } from "@/utils/formatDate";
import { mockCaregiverNameList } from "@/mocks/mockHighlightTableData";

const HighlightTable: React.FC = () => {
  const [allHighlights, setAllHighlights] = useState<HighlightTableData[]>([]);
  const [myHighlights, setMyHighlights] = useState<HighlightTableData[]>([]);
  const [highlights, setHighlights] = useState<HighlightTableData[]>([]);
  const [highlightTypes, setHighlightTypes] = useState<HighlightType[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCaregiver, setSelectedCaregiver] = useState<string>("All");
  const [searchItem, setSearchItem] = useState("");
  const [showMyPatientsOnly, setShowMyPatientsOnly] = useState(true);
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
        count === 0 ||
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

  // Filter highlights based on search, type, caregiver
  const applyFilters = (data: HighlightTableData[]) => {
    let filtered = data.filter(({ patientName }) =>
      patientName.toLowerCase().includes(searchItem.toLowerCase())
    );

    filtered = filtered.filter(({ type }) =>
      selectedTypes.includes(type)
    );

    filtered = filtered.filter(({ caregiverId }) =>
      selectedCaregiver === "All" || caregiverId.toString() === selectedCaregiver
    );

    return flattenHighlights(filtered);
  };

  // Fetch all highlights once and split into "all" and "my patients"
  const initializeHighlights = async () => {
    try {
      // Fetch both all patients and my patients highlights at once
      const [all, my] = await Promise.all([
        fetchHighlights(true),  // showAllPatients = true
        fetchHighlights(false), // showAllPatients = false
      ]);

      // Store separately in state
      setAllHighlights(all);
      setMyHighlights(my);

      // Show default table based on toggle
      setHighlights(showMyPatientsOnly ? applyFilters(my) : applyFilters(all));
    } catch (error) {
      console.error("Error fetching highlights:", error);
    }
  };

  useEffect(() => {
    fetchHighlightTypes()
      .then((highlightTypes) => {
        setHighlightTypes(highlightTypes);
        setSelectedTypes(highlightTypes.map(({ TypeName }) => TypeName));
      })
      .catch(console.error);

    initializeHighlights();
  }, []);

  // Re-apply filters whenever toggle, search, type, or caregiver changes
  useEffect(() => {
    const data = showMyPatientsOnly ? myHighlights : allHighlights;
    setHighlights(applyFilters(data));
  }, [showMyPatientsOnly, selectedTypes, selectedCaregiver, debouncedSearch, myHighlights, allHighlights]);

  // Format highlight type for display
  const formatHighlightType = (highlightType?: string | null) => {
    if (!highlightType || typeof highlightType !== "string") return "-";
    const spaced = highlightType.replace(/([a-z])([A-Z])/g, "$1 $2");

    return spaced
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
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
            </div>
          </div>
        ) : (
          <div></div>
        ),
    },
    {
      key: "highlightCreatedDate",
      header: "Created Date",
      render: (_: string, highlight: HighlightTableData) => {
        if (!highlight.highlightCreatedDate) return <div>-</div>;

        // Use your existing helper
        const formattedDate = formatDate(highlight.highlightCreatedDate);

        return <div className="font-medium">{formattedDate}</div>;
      },
    },
    {
      key: "type",
      header: "Type",
      render: (value: string, highlight: HighlightTableData) =>
        highlight.showType ? (
          <div className="font-medium">{formatHighlightType(value ?? "-")}</div>
        ) : (
          ""
        ),
    },
    {
      key: "highlightText", 
      header: "Highlight Text",
      render: (_: string, highlight: HighlightTableData) => (
        <div className="font-medium">{highlight.value ?? highlight.highlightText ?? "-"}</div>
      ),
    },
    {
      key: "details",
      header: "Details",
      render: (_: string, highlight: HighlightTableData) => {
        const parsed = highlight.parsedHighlight;
        if (!parsed) return <span>-</span>;

        let detailsContent: React.ReactNode = null;

        switch (highlight.type) {
          case "New Problem": {
            const f = parsed ?? {};
            if (!f || Object.keys(f).length === 0) return <span>-</span>;
            detailsContent = (
              <div className="space-y-1 text-sm">
                <div><b>Description:</b> {f.problem_name ?? ""}</div>
                {f.date_of_diagnosis && <div><b>Date of diagnosis:</b> {String(f.date_of_diagnosis).split("T")[0]}</div>}
                {f.source_of_information && <div><b>Source:</b> {f.source_of_information}</div>}
                <div><b>Remarks:</b> {f.problem_remarks ?? "-"}</div>
              </div>
            );
            break;
          }
          case "New Allergy": {
            const f = (parsed as any)?.additional_fields ?? (parsed as any) ?? {};
            detailsContent = (
              <div className="space-y-1 text-sm">
                <div><b>Allergy:</b> {f.allergy_type ?? "-"}</div>
                <div><b>Reaction:</b> {f.allergy_reaction_type ?? "-"}</div>
                <div><b>Remarks:</b> {highlight.sourceRemarks ?? "-"}</div>
              </div>
            );
            break;
          }
          case "New Medication":
          case "New Prescription": {
            const f = (parsed as any)?.additional_fields ?? (parsed as any) ?? {};
            const startDate = f.start_date ? String(f.start_date).split("T")[0] : "-";
            const endDate = f.end_date ? String(f.end_date).split("T")[0] : "-";
            detailsContent = (
              <div className="space-y-1 text-sm">
                <div><b>Name:</b> {f.prescription_name ?? f.prescription_name ?? "-"}</div>
                <div><b>Dosage:</b> {f.dosage ?? "-"}</div>
                {highlight.type === "New Prescription" && <div><b>Frequency:</b> {f.frequency_per_day ?? "-"} per day</div>}
                <div><b>Instruction:</b> {f.instruction ?? "-"}</div>
                <div><b>Start:</b> {startDate}</div>
                <div><b>End:</b> {endDate}</div>
                <div><b>Remarks:</b> {highlight.sourceRemarks ?? "-"}</div>
              </div>
            );
            break;
          }
          case "Vital Signs Alert": {
            const f = (parsed as any)?.additional_fields ?? (parsed as any) ?? {};
            const baseline = f.default_baselines ?? {};
            detailsContent = (
              <div className="space-y-1 text-sm">
                <div><b>Temp (°C):</b> {f.temperature ?? "-"} (Normal: {baseline.temperature ?? "-"})</div>
                <div><b>BP:</b> {f.systolic_bp ?? "-"} / {f.diastolic_bp ?? "-"} (Normal: {baseline.systolic_bp ?? "-"} / {baseline.diastolic_bp ?? "-"})</div>
                <div><b>HR:</b> {f.heart_rate ?? "-"} (Normal: {baseline.heart_rate ?? "-"})</div>
                <div><b>SpO₂:</b> {f.spo2 ?? "-"} (Normal: {baseline.spo2 ?? "-"})</div>
                <div><b>Blood Sugar:</b> {f.blood_sugar_level ?? "-"} (Normal: {baseline.blood_sugar ?? "-"})</div>
                <div><b>Remarks:</b> {highlight.sourceRemarks ?? "-"}</div>
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
              <Button variant="outline" size="sm" className="h-8 px-2 text-sm font-medium">
                View Details
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3">{detailsContent}</PopoverContent>
          </Popover>
        );
      },
    },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col container mx-auto px-0 sm:px-4">
      <div className="flex flex-col sm:gap-4 sm:py-6">
        <div className="flex">
          <Searchbar searchItem={searchItem} onSearchChange={handleInputChange} />
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              className="h-8 flex items-center gap-1"
              onClick={() => setShowMyPatientsOnly(prev => !prev)}
            >
              {showMyPatientsOnly ? "My Patients" : "All Patients"}
              <ChevronDown className="w-4 h-4 transition-transform duration-200"
                          style={{ transform: showMyPatientsOnly ? "rotate(0deg)" : "rotate(180deg)" }} />
            </Button>

            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <ListFilter className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Category</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {highlightTypes.map(({ TypeName }) => (
                  <DropdownMenuCheckboxItem
                    key={TypeName}
                    checked={selectedTypes.includes(TypeName)}
                    onCheckedChange={(checked: boolean) => {
                      if (checked) setSelectedTypes((prev) => [...prev, TypeName]);
                      else setSelectedTypes((prev) => prev.filter((item) => item !== TypeName));
                    }}
                  >
                    {formatHighlightType(TypeName)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <ListFilter className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Caregiver</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup
                  value={selectedCaregiver}
                  onValueChange={setSelectedCaregiver}
                >
                  <DropdownMenuRadioItem value="All">All</DropdownMenuRadioItem>
                  {mockCaregiverNameList.map(({ id, name }) => (
                    <DropdownMenuRadioItem key={id} value={id.toString()}>{name}</DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Card className="ml-4 sm:ml-6 px-4 py-2">
          <CardHeader>
            <CardTitle>Patient Highlights</CardTitle>
            <CardDescription>View recent changes to patient's information.</CardDescription>
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