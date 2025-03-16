import { useModal } from "@/hooks/useModal";
import { Button } from "../../ui/button";
import {
  fetchDietList,
  fetchEducationList,
  fetchLiveWithList,
  fetchOccupationList,
  fetchPetList,
  fetchReligionList,
  fetchSocialHistory,
  SocialHistory,
  SocialHistoryDDItem,
  updateSocialHistory,
  UpdateSocialHistory,
} from "@/api/patients/socialHistory";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getDateTimeNowInUTC } from "@/utils/formatDate";

const EditSocialHistoryModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { patientId, submitterId, refreshData } = activeModal.props as {
    patientId: string;
    submitterId: string;
    refreshData: () => void;
  };
  const [rowData, setRowData] = useState<SocialHistory | null>(null);
  const [dietList, setDietList] = useState<SocialHistoryDDItem[]>([]);
  const [educationList, setEducationList] = useState<SocialHistoryDDItem[]>([]);
  const [liveWithList, setLiveWithList] = useState<SocialHistoryDDItem[]>([]);
  const [occupationList, setOccupationList] = useState<SocialHistoryDDItem[]>(
    []
  );
  const [petList, setPetList] = useState<SocialHistoryDDItem[]>([]);
  const [religionList, setReligionList] = useState<SocialHistoryDDItem[]>([]);

  const handleFetchDietList = async () => {
    try {
      const response = await fetchDietList();
      setDietList(response);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to fetch Diet List");
    }
  };

  const handleFetchEducationList = async () => {
    try {
      const response = await fetchEducationList();
      setEducationList(response);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to fetch Education List");
    }
  };

  const handleFetchLiveWithList = async () => {
    try {
      const response = await fetchLiveWithList();
      setLiveWithList(response);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to fetch Live With List");
    }
  };

  const handleOccupationList = async () => {
    try {
      const response = await fetchOccupationList();
      setOccupationList(response);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to fetch Occupation List");
    }
  };

  const handlePetList = async () => {
    try {
      const response = await fetchPetList();
      setPetList(response);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to fetch Pet List");
    }
  };

  const handleReligionList = async () => {
    try {
      const response = await fetchReligionList();
      setReligionList(response);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to fetch Religion List");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (rowData) {
      setRowData({ ...rowData, [name]: value });
    }
  };

  const handleFetchSocialHistory = async () => {
    if (!patientId || isNaN(Number(patientId))) {
      return;
    }

    try {
      const fetchedSocialHistory: SocialHistory = await fetchSocialHistory(
        Number(patientId)
      );
      setRowData(fetchedSocialHistory);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to fetch social history");
    }
  };

  const handleEditSocialHistory = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!rowData) {
      return;
    }

    // Create a new FormData object from the event's target
    const formData = new FormData(event.target as HTMLFormElement);

    // Convert FormData entries to an object
    const formDataObj = Object.fromEntries(formData.entries());

    console.log("formDataObj", formDataObj);

    const dateTimeNow = getDateTimeNowInUTC();

    const socialHistoryFormData: UpdateSocialHistory = {
      patientId: parseInt(patientId as string, 10),
      sexuallyActive: parseInt(formDataObj.sexuallyActive as string, 10),
      secondHandSmoker: parseInt(formDataObj.secondHandSmoker as string, 10),
      alcoholUse: parseInt(formDataObj.alcoholUse as string, 10),
      caffeineUse: parseInt(formDataObj.caffeineUse as string, 10),
      tobaccoUse: parseInt(formDataObj.tobaccoUse as string, 10),
      drugUse: parseInt(formDataObj.drugUse as string, 10),
      exercise: parseInt(formDataObj.exercise as string, 10),
      dietListId: parseInt(formDataObj.dietListId as string, 10),
      educationListId: parseInt(formDataObj.educationListId as string, 10),
      liveWithListId: parseInt(formDataObj.liveWithListId as string, 10),
      occupationListId: parseInt(formDataObj.occupationListId as string, 10),
      petListId: parseInt(formDataObj.petListId as string, 10),
      religionListId: parseInt(formDataObj.religionListId as string, 10),
      id: rowData.id,
      modifiedById: parseInt(submitterId as string, 10),
      modifiedDate: dateTimeNow,
    };

    try {
      console.log("socialHistoryFormData", socialHistoryFormData);

      await updateSocialHistory(
        parseInt(patientId as string, 10),
        socialHistoryFormData
      );
      closeModal();
      toast.success("Patient social history updated successfully.");
      refreshData();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(
          `Failed to update patient social history. ${error.message}`
        );
      } else {
        // Fallback error handling for unknown error types
        toast.error(
          "Failed to update patient social history. An unknown error occurred."
        );
      }
    }

    closeModal();
  };

  useEffect(() => {
    handleFetchDietList();
    handleFetchEducationList();
    handleFetchLiveWithList();
    handleOccupationList();
    handlePetList();
    handleReligionList();
    handleFetchSocialHistory();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[600px]">
        <h3 className="text-lg font-medium mb-5">Add Social History</h3>
        <form
          onSubmit={handleEditSocialHistory}
          className="grid grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-sm font-medium">
              Alcohol Use<span className="text-red-600">*</span>
            </label>
            <select
              name="alcoholUse"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              value={rowData?.alcoholUse}
              onChange={handleChange}
              required
            >
              <option value="2">Not to Tell</option>
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Caffeine Use<span className="text-red-600">*</span>
            </label>
            <select
              name="caffeineUse"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              value={rowData?.caffeineUse}
              onChange={handleChange}
              required
            >
              <option value="2">Not to Tell</option>
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Occupation <span className="text-red-600">*</span>
            </label>
            <select
              name="occupationListId"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              value={rowData?.occupationListId}
              onChange={handleChange}
              required
            >
              <option value="-1">Not to tell</option>
              {occupationList.map((ol) => (
                <option key={ol.Id} value={ol.Id}>
                  {ol.Value}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Diet</label>
            <select
              name="dietListId"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              value={rowData?.dietListId}
              onChange={handleChange}
              required
            >
              <option value="-1">Not to tell</option>
              {dietList.map((dl) => (
                <option key={dl.Id} value={dl.Id}>
                  {dl.Value}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Pet
              <span className="text-red-600">*</span>
            </label>
            <select
              name="petListId"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              value={rowData?.petListId}
              onChange={handleChange}
              required
            >
              <option value="-1">Not to tell</option>
              {petList.map((pl) => (
                <option key={pl.Id} value={pl.Id}>
                  {pl.Value}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Drug Use
              <span className="text-red-600">*</span>
            </label>
            <select
              name="drugUse"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              value={rowData?.drugUse}
              onChange={handleChange}
              required
            >
              <option value="2">Not to Tell</option>
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Religion
              <span className="text-red-600">*</span>
            </label>
            <select
              name="religionListId"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              value={rowData?.religionListId}
              onChange={handleChange}
              required
            >
              <option value="-1">Not to tell</option>
              {religionList.map((rl) => (
                <option key={rl.Id} value={rl.Id}>
                  {rl.Value}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Education<span className="text-red-600">*</span>
            </label>
            <select
              name="educationListId"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              value={rowData?.educationListId}
              onChange={handleChange}
              required
            >
              <option value="-1">Not to tell</option>
              {educationList.map((el) => (
                <option key={el.Id} value={el.Id}>
                  {el.Value}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Secondhand Smoker<span className="text-red-600">*</span>
            </label>
            <select
              name="secondHandSmoker"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              value={rowData?.secondHandSmoker}
              onChange={handleChange}
              required
            >
              <option value="2">Not to Tell</option>
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Exercise<span className="text-red-600">*</span>
            </label>
            <select
              name="exercise"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              value={rowData?.exercise}
              onChange={handleChange}
              required
            >
              <option value="2">Not to Tell</option>
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Sexually Active
              <span className="text-red-600">*</span>
            </label>
            <select
              name="sexuallyActive"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              value={rowData?.sexuallyActive}
              onChange={handleChange}
              required
            >
              <option value="2">Not to Tell</option>
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Live With
              <span className="text-red-600">*</span>
            </label>
            <select
              name="liveWithListId"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              value={rowData?.liveWithListId}
              onChange={handleChange}
              required
            >
              <option value="-1">Not to tell</option>
              {liveWithList.map((lwl) => (
                <option key={lwl.Id} value={lwl.Id}>
                  {lwl.Value}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Tobacoo Use
              <span className="text-red-600">*</span>
            </label>
            <select
              name="tobaccoUse"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              value={rowData?.tobaccoUse}
              onChange={handleChange}
              required
            >
              <option value="2">Not to Tell</option>
              <option value="0">No</option>
              <option value="1">Yes</option>
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

export default EditSocialHistoryModal;
