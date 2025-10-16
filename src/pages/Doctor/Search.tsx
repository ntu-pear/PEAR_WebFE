// src/pages/doctor/Search.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ListFilter, File } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Searchbar from "@/components/Searchbar";
import useDebounce from "@/hooks/useDebounce";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableClient } from "@/components/Table/DataTable";
import {
  searchTypes,
  radioOptionsByType,
  localSearch,
  type SearchType,
  type SearchResult,
  fieldLabelByType,
} from "@/mocks/mockDoctorSearch";

const DoctorSearch: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<SearchType>("all");
  const [option, setOption] = useState<number | undefined>(undefined);
  const [results, setResults] = useState<SearchResult[]>([]);

  const debouncedQuery = useDebounce(query, 300);
  const radioOptions = useMemo(() => radioOptionsByType[type] ?? [], [type]);

  useEffect(() => {
    if (!radioOptions.length) setOption(undefined);
  }, [radioOptions.length]);

  useEffect(() => {
    const test = localSearch(type, debouncedQuery, option);
    console.log(test);
    setResults(localSearch(type, debouncedQuery, option));
  }, [type, debouncedQuery, option]);

  const columns: {
    key: keyof SearchResult;
    header: string;
    render?: (value: any, item: SearchResult) => React.ReactNode;
    className?: string;
  }[] = [
    { key: "patientName", header: "Patient" },
    {
      key: "isActive",
      header: "Status",
      className: "hidden md:table-cell",
      render: (value: boolean | null) =>
        value === true ? (
          <span className="text-green-600">Active</span>
        ) : value === false ? (
          <span className="text-red-600">Inactive</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    { key: "type", header: "Type", className: "hidden md:table-cell" },
    { key: "name", header: "Value" },
    {
      key: "message",
      header: "Details",
      className: "truncate",
      render: (value: string | undefined) => (
        <span title={value ?? ""}>{value ?? ""}</span>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col container mx-auto px-4">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between sm:pr-6">
          <Searchbar
            searchItem={query}
            onSearchChange={(e) => setQuery(e.target.value)}
          />

          <div className="flex gap-2">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <ListFilter className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Type
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup
                  value={type}
                  onValueChange={(v) => setType(v as SearchType)}
                >
                  {searchTypes.map((t) => (
                    <DropdownMenuRadioItem key={t.value} value={t.value}>
                      {t.text}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {radioOptions.length > 0 && (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <ListFilter className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      {type === "preference"
                        ? "Preference"
                        : type === "exclusion"
                          ? "Exclusion"
                          : "Recommendation"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuRadioGroup
                    value={option?.toString()}
                    onValueChange={(v) => setOption(Number(v))}
                  >
                    {radioOptions.map((o) => (
                      <DropdownMenuRadioItem
                        key={o.value}
                        value={String(o.value)}
                      >
                        {o.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button size="sm" variant="outline" className="h-8 gap-1">
              <File className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Export
              </span>
            </Button>
          </div>
        </div>

        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Search</CardTitle>
              <CardDescription>
                Search for patients by <b>{fieldLabelByType[type]}</b>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTableClient
                data={results}
                columns={columns}
                viewMore={false}
                renderActions={(row: SearchResult) =>
                  row.patientId ? (
                    <Button
                      size="sm"
                      onClick={() =>
                        navigate(`/supervisor/view-patient/${row.patientId}`)
                      }
                    >
                      View
                    </Button>
                  ) : null
                }
                hideActionsHeader={false}
              />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default DoctorSearch;
