import { Button } from "../../ui/button";
import { toast } from "sonner";
import { useModal } from "@/hooks/useModal";
import { useEffect, useState } from "react";
import {
  fetchMobilityAidById,
  fetchMobilityList,
  MobilityAid,
  MobilityList,
  updateMobilityAid,
  UpdateMobilityAid,
} from "@/api/patients/mobility";

const EditMobilityAid: React.FC = () => {
  const [rowData, setRowData] = useState<MobilityAid | null>(null);
  const [mobilityList, setMobilityList] = useState<MobilityList[]>([]);
  const { modalRef, activeModal, closeModal } = useModal();
  const { mobilityAidId, refreshData } = activeModal.props as {
    mobilityAidId: string;
    refreshData: () => void;
  };
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setRowData((prevData) => ({
      ...prevData!,
      [name]: name === "IsRecovered" ? value === "true" : value,
    }));
  };
  const handleEditMobilityAid = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!mobilityAidId || isNaN(Number(mobilityAidId))) return;
    // Create a new FormData object from the event's target
    const formData = new FormData(event.target as HTMLFormElement);
    // Convert FormData entries to an object
    const formDataObj = Object.fromEntries(formData.entries());

    const MobilityAidFormData: UpdateMobilityAid = {
      MobilityRemarks: (formDataObj.MobilityRemarks as string).trim(),
      IsRecovered: formDataObj.IsRecovered === "true" ? true : false,
    };
    try {
      console.log("MobilityAidFormData: ", MobilityAidFormData);
      await updateMobilityAid(Number(mobilityAidId), MobilityAidFormData);
      closeModal();
      toast.success("Patient mobility aid updated successfully.");
      refreshData();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      closeModal();
      toast.error("Failed to update patient mobility aid.");
    }
  };

  const handleFetchMobilityAid = async () => {
    if (!mobilityAidId || isNaN(Number(mobilityAidId))) {
      return;
    }

    try {
      const response: MobilityAid = await fetchMobilityAidById(
        Number(mobilityAidId)
      );
      console.log("fetch autofill for edit mobility aid response", response);
      setRowData(response);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      console.log("error", error);
      toast.error("Failed to fetch Mobility Aid");
    }
  };

  const handleFetchMobilityList = async () => {
    try {
      const fetchedMobilityList: MobilityList[] = await fetchMobilityList();
      setMobilityList(fetchedMobilityList);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to fetch Mobility List");
    }
  };

  useEffect(() => {
    handleFetchMobilityAid();
    handleFetchMobilityList();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[400px]">
        <h3 className="text-lg font-medium mb-5">Edit Mobility Aid</h3>
        <div className="col-span-2 mb-4">
          <label className="block text-sm font-medium">Mobility Aids</label>
          <input
            name="MobilityAids"
            value={
              mobilityList.find(
                (ml) => ml.MobilityListId === rowData?.MobilityListId
              )?.Value || ""
            }
            className="mt-1 block w-full p-2 border rounded-md text-gray-900"
            readOnly
          />
        </div>
        <form
          onSubmit={handleEditMobilityAid}
          className="grid grid-cols-2 gap-4"
        >
          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Mobility Remark<span className="text-red-600">*</span>
            </label>
            <textarea
              name="MobilityRemarks"
              value={rowData?.MobilityRemarks || ""}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Condition<span className="text-red-600">*</span>
            </label>
            <select
              name="IsRecovered"
              value={rowData?.IsRecovered ? "true" : "false"}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="">Please select a option</option>
              <option value="false">Not Recovered</option>
              <option value="true">Fully Recovered</option>
            </select>
          </div>
          <div className="col-span-2 mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">Update</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMobilityAid;
