import { useModal } from "@/hooks/useModal";
import { Button } from "../../ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
    DementiaStageType,
    DementiaType,
    DiagnosedDementiaTD,
    EditDementiaForm,
    editDiagnosedDementa,
    fetchDementiaStageList,
    fetchDementiaTypeList,
} from "@/api/patients/diagnosedDementia";
import { getDateTimeNowInUTC } from "@/utils/formatDate";

const EditDiagnosedDementiaModal: React.FC = () => {
    const { modalRef, activeModal, closeModal } = useModal();
    const { diagnosedDementia, submitterId, refreshData } = activeModal.props as {
        diagnosedDementia: DiagnosedDementiaTD
        submitterId: string;
        refreshData: () => void;
    };

    const [dementiaTypes, setDementiaTypes] = useState<DementiaType[]>([]);
    const [dementiaStageTypes, setDementiaStageTypes] = useState<DementiaStageType[]>([]);
    const [rowData, setRowData] = useState<DiagnosedDementiaTD>(diagnosedDementia);

    const handleFetchDementiaType = async () => {
        try {
            const fetchedDementiaTypes: DementiaType[] =
                await fetchDementiaTypeList();
            const activeDementiaTypes = fetchedDementiaTypes.filter(dt => dt.IsDeleted === '0')
            setDementiaTypes(activeDementiaTypes);
            const fetchedDementiaStageTypes: DementiaStageType[] = await fetchDementiaStageList();
            const activeDementiaStageTypes = fetchedDementiaStageTypes.filter((st) => st.IsDeleted === '0')
            setDementiaStageTypes(activeDementiaStageTypes)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            toast.error("Failed to fetch Dementia Types List");
        }
    };

    const handleEditDementia = async (event: React.FormEvent) => {
        event.preventDefault();

        // Create a new FormData object from the event's target
        const formData = new FormData(event.target as HTMLFormElement);

        // Convert FormData entries to an object
        const formDataObj = Object.fromEntries(formData.entries());

        const dementiaFormData: EditDementiaForm = {
            IsDeleted: "0",
            DementiaTypeListId: rowData.DementiaTypeListId,
            DementiaStageId: parseInt(formDataObj.DementiaStageListId as string, 10),
            ModifiedDate: getDateTimeNowInUTC() as string,
            ModifiedById: submitterId as string,
        };

        try {
            await editDiagnosedDementa(Number(rowData.id), dementiaFormData);
            closeModal();
            toast.success("Diagnosed dementia assigned successfully.");
            refreshData();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            if (error instanceof Error) {
                toast.error(`Failed to update diagnosed dementia. ${error.message}`);
            } else {
                toast.error(`Failed to update diagnosed dementia.`);
            }
            console.log("Failed to update diagnosed dementia.")
            console.error(error)
            closeModal();
        }
    };

    useEffect(() => {
        handleFetchDementiaType();
        console.log("EDit diagnosed dementia", diagnosedDementia)
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div ref={modalRef} className="bg-background p-8 rounded-md w-[400px]">
                <h3 className="text-lg font-medium mb-5">Edit Diagnosed Dementia</h3>
                <div className="col-span-2 mb-4">
                    <label className="block text-sm font-medium">Diagnosed Dementia</label>
                    <input
                        name="dementiaTypeId"
                        value={
                            dementiaTypes.find(
                                (dt) => dt.DementiaTypeListId === rowData.DementiaTypeListId
                            )?.Value || ""
                        }
                        className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                        readOnly
                    />
                </div>
                <form onSubmit={handleEditDementia} className="grid grid-cols-2 gap-4">

                    <div className="col-span-2">
                        <label className="block text-sm font-medium">
                            Dementia Stage<span className="text-red-600">*</span>
                        </label>
                        <select
                            name="DementiaStageListId"
                            className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                            required
                            value={rowData.DementiaStageId}
                            onChange={(e) => setRowData({ ...rowData, DementiaStageId: Number(e.target.value) })}
                        >
                            <option value="">Please select an option</option>
                            {dementiaStageTypes.map((st) => (
                                <option
                                    key={st.id}
                                    value={st.id}
                                >
                                    {st.DementiaStage}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-span-2 mt-6 flex justify-end space-x-2">
                        <Button variant="outline" onClick={closeModal}>
                            Cancel
                        </Button>
                        <Button type="submit">Assign</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditDiagnosedDementiaModal;
