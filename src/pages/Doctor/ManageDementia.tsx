import { useEffect, useMemo, useState } from "react";
import { Info, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import Searchbar from "@/components/Searchbar";
import useDebounce from "@/hooks/useDebounce";
import { DataTableClient, TableRowData } from "@/components/Table/DataTable";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  DementiaType,
  fetchDementiaTypeList,
} from "@/api/patients/diagnosedDementia";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  GameCategoryRow,
  GameRow,
  fetchGameCategoryByDementiaMock,
  fetchGamesByDementiaMock,
} from "@/mocks/mockDementiaGames";

interface DementiaTypeTableData extends TableRowData {
  Value: string;
  IsDeleted: string; // "0" | "1"
  DementiaTypeListId: number;
  CreatedDate: string;
  ModifiedDate: string;
}

const GameCategoryExpandedRow: React.FC<{
  dementia: DementiaTypeTableData;
  onAdd?: (dementia: DementiaTypeTableData) => void;
}> = ({ dementia, onAdd }) => {
  const [rows, setRows] = useState<GameCategoryRow[]>([]);

  useEffect(() => {
    fetchGameCategoryByDementiaMock(dementia.DementiaTypeListId).then((data) =>
      setRows(data)
    );
  }, [dementia.DementiaTypeListId]);

  const columns: {
    key: keyof GameCategoryRow;
    header: string;
    className?: string;
  }[] = [
    { key: "category", header: "Category" },
    { key: "recommender", header: "Recommender" },
    {
      key: "recommendReason",
      header: "Reason for recommendation",
      className: "truncate",
    },
    {
      key: "rejectionReason",
      header: "Reason for rejection",
      className: "truncate",
    },
  ];

  return (
    <div className="border rounded-md p-3 mt-3 bg-muted/30">
      <div className="flex justify-between mb-3 items-center">
        <div className="font-medium">Game Categories for {dementia.Value}</div>
        <Button size="sm" onClick={() => onAdd?.(dementia)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Recommend Game Category
        </Button>
      </div>
      <DataTableClient<GameCategoryRow>
        data={rows}
        columns={columns}
        hideActionsHeader
        viewMore={false}
      />
    </div>
  );
};

const GameExpandedRow: React.FC<{ dementia: DementiaTypeTableData }> = ({
  dementia,
}) => {
  const [rows, setRows] = useState<GameRow[]>([]);

  useEffect(() => {
    fetchGamesByDementiaMock(dementia.DementiaTypeListId)
      .then((data) => setRows(data))
      .catch(() => toast.error("Failed to load games"));
  }, [dementia.DementiaTypeListId]);

  const columns: { key: keyof GameRow; header: string; className?: string }[] =
    [
      { key: "title", header: "Game Title" },
      { key: "description", header: "Description", className: "truncate" },
      { key: "category", header: "Category" },
      { key: "therapist", header: "Game Therapist" },
      {
        key: "recommendReason",
        header: "Recommendation Reason",
        className: "truncate",
      },
      {
        key: "rejectionReason",
        header: "Rejection Reason",
        className: "truncate",
      },
    ];

  return (
    <div className="border rounded-md p-3 mt-3 bg-muted/30">
      <div className="font-medium mb-3">Games for {dementia.Value}</div>
      <DataTableClient<GameRow>
        data={rows}
        columns={columns}
        hideActionsHeader
        viewMore={false}
      />
    </div>
  );
};

const ManageDementia: React.FC = () => {
  const [dementiaTypeList, setDementiaTypeList] = useState<DementiaType[]>([]);
  const [tabValue, setTabValue] = useState<"game_category" | "game">(
    "game_category"
  );
  const [search, setSearch] = useState("");
  const q = useDebounce(search, 300);

  useEffect(() => {
    fetchDementiaTypeList()
      .then((data) => setDementiaTypeList(data))
      .catch(() => toast.error("Failed to fetch Dementia Types List"));
  }, []);

  const filtered: DementiaTypeTableData[] = useMemo(
    () =>
      dementiaTypeList
        .filter(({ Value }) => Value.toLowerCase().includes(q.toLowerCase()))
        .map((d) => ({ ...d, id: d.DementiaTypeListId })),
    [dementiaTypeList, q]
  );

  const dementiaColumns = [
    { key: "Value" as const, header: "Dementia", className: "truncate" },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col container mx-auto px-0 sm:px-4">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        {/* Callout */}
        <div className="rounded-xl border bg-muted/40 p-4 flex gap-3 sm:ml-6">
          <Info className="h-5 w-5 mt-0.5" />
          <div className="text-sm leading-5">
            <div className="font-medium">
              Need changes to the Dementia list?
            </div>
            Please contact the{" "}
            <span className="font-semibold">System Administrator</span> to add,
            edit, or delete entries.
          </div>
        </div>

        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Tabs
            value={tabValue}
            onValueChange={(val) => setTabValue(val as any)}
          >
            <div className="flex items-center justify-between sm:-mr-6">
              <TabsList>
                <TabsTrigger value="game_category">Game Category</TabsTrigger>
                <TabsTrigger value="game">Game</TabsTrigger>
              </TabsList>
              <Searchbar
                searchItem={search}
                onSearchChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Game Category Tab */}
            <TabsContent value="game_category">
              <Card>
                <CardHeader>
                  <CardTitle>Dementia Game Categories</CardTitle>
                  <CardDescription>
                    Assign game categories for dementia
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTableClient<DementiaTypeTableData>
                    data={filtered}
                    columns={dementiaColumns}
                    viewMore={false}
                    hideActionsHeader
                    expandable
                    renderExpandedContent={(row) => (
                      <GameCategoryExpandedRow
                        dementia={row}
                        onAdd={(d) =>
                          toast.message(
                            `Open "Recommend Game Category" for: ${d.Value}`
                          )
                        }
                      />
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Game Tab */}
            <TabsContent value="game">
              <Card>
                <CardHeader>
                  <CardTitle>Dementia Games</CardTitle>
                  <CardDescription>Assign games for dementia</CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTableClient<DementiaTypeTableData>
                    data={filtered}
                    columns={dementiaColumns}
                    viewMore={false}
                    hideActionsHeader
                    expandable
                    onExpand={() => {}}
                    renderExpandedContent={(row) => (
                      <GameExpandedRow dementia={row} />
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default ManageDementia;
