import { useModal } from "@/hooks/useModal";
import { Button } from "../../ui/button";
import {
  addSocialHistory,
  AddSocialHistory,
  fetchDietList,
  fetchEducationList,
  fetchLiveWithList,
  fetchOccupationList,
  fetchPetList,
  fetchReligionList,
  SocialHistoryDDItem,
} from "@/api/patients/socialHistory";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getDateTimeNowInUTC } from "@/utils/formatDate";

const AddSocialHistoryModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { patientId, submitterId, refreshData } = activeModal.props as {
    patientId: string;
    submitterId: string;
    refreshData: () => void;
  };

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

  const handleAddSocialHistory = async (event: React.FormEvent) => {
    event.preventDefault();

    // Create a new FormData object from the event's target
    const formData = new FormData(event.target as HTMLFormElement);

    // Convert FormData entries to an object
    const formDataObj = Object.fromEntries(formData.entries());

    const dateTimeNow = getDateTimeNowInUTC();

    const socialHistoryFormData: AddSocialHistory = {
      isDeleted: "0",
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
      createdDate: dateTimeNow,
      modifiedDate: dateTimeNow,
      createdById: submitterId as string,
      modifiedById: submitterId as string,
    };

    try {
      console.log("socialHistoryFormData", socialHistoryFormData);

      await addSocialHistory(socialHistoryFormData);
      closeModal();
      toast.success("Patient social history added successfully.");
      refreshData();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to add patient social history. ${error.message}`);
      } else {
        // Fallback error handling for unknown error types
        toast.error(
          "Failed to add patient social history. An unknown error occurred."
        );
      }
    }
  };

  useEffect(() => {
    handleFetchDietList();
    handleFetchEducationList();
    handleFetchLiveWithList();
    handleOccupationList();
    handlePetList();
    handleReligionList();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[600px]">
        <h3 className="text-lg font-medium mb-5">Add Social History</h3>
        <form
          onSubmit={handleAddSocialHistory}
          className="grid grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-sm font-medium">
              Alcohol Use<span className="text-red-600">*</span>
            </label>
            <select
              name="alcoholUse"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="2">Not Available</option>
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
              required
            >
              <option value="2">Not Available</option>
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
              required
            >
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
              required
            >
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
              required
            >
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
              required
            >
              <option value="2">Not Available</option>
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
              required
            >
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
              required
            >
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
              required
            >
              <option value="2">Not Available</option>
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
              required
            >
              <option value="2">Not Available</option>
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
              required
            >
              <option value="2">Not Available</option>
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
              required
            >
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
              required
            >
              <option value="2">Not Available</option>
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </div>

          <div className="col-span-2 mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">Add</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSocialHistoryModal;
