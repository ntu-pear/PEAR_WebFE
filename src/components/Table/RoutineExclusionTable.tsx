import { fetchRoutineExclusion, RoutineExclusion } from "@/api/activity/routine"
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTableClient } from "./DataTable";
import { useEffect, useState } from "react";
import { useModal } from "@/hooks/useModal";

interface RoutineExclusionTableProps {
    routine_id: number,
    routine_startDate: string,
    routine_endDate: string
}
const RoutineExclusionTable: React.FC<RoutineExclusionTableProps> = ({ routine_id, routine_startDate, routine_endDate }) => {
    const { openModal } = useModal()
    const columns: { key: keyof RoutineExclusion; header: string }[] = [
        { key: "start_date", header: "Start Date" },
        { key: "end_date", header: "End Date" },
        { key: "remarks", header: "Remarks" }
    ]
    const [routineExclusion, setRoutineExclusion] = useState<RoutineExclusion[]>([])

    const refreshRoutineExclusion = async () => {
        try {
            const response = await fetchRoutineExclusion(routine_id)
            setRoutineExclusion(response)
        } catch (error) {
            console.log("No routine exclusions found or error fetching:", error)
            setRoutineExclusion([])
        }
    }

    useEffect(() => {
        refreshRoutineExclusion()
    }, [routine_id, routine_startDate, routine_endDate])


    const renderActions = (item: RoutineExclusion) => {
        return (
            <div className="flex space-x-2 w-[75px] sm:w-[150px]">
                <Button
                    size="sm"
                    className="mt-3"
                    onClick={() =>
                        openModal("editRoutineExclusion", {
                            routineExclusion: item,
                            routineId: routine_id,
                            routine_startDate: routine_startDate,
                            routine_endDate: routine_endDate,
                            refreshRoutineExclusion,
                        })
                    }
                >
                    Edit
                </Button>
                <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="mt-3"
                    onClick={() =>
                        openModal("deleteRoutineExclusion", {
                            exclusionId: item.id,
                            refreshRoutineExclusion,
                        })
                    }
                >
                    Delete
                </Button>
            </div>
        );
    };


    return (
        <div className="py-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Routine Exclusion</h3>
                <Button
                    size="sm"
                    className="h-8 gap-1"
                    onClick={() =>
                        openModal("addRoutineExclusion", {
                            routineId: routine_id,
                            routine_startDate: routine_startDate,
                            routine_endDate: routine_endDate,
                            refreshRoutineExclusion,
                        })
                    }
                >
                    <PlusCircle className="h-4 w-4" />
                    <span className="whitespace-nowrap">Add Exclusion</span>
                </Button>
            </div>
            <DataTableClient
                data={routineExclusion}
                columns={columns}
                viewMore={false}
                renderActions={renderActions}
                className="w-full table-fixed"
            />

        </div>
    )
}

export default RoutineExclusionTable