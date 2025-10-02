import { CreateActivityRecommendationPayload } from "@/api/activity/activityRecommendation";
import RadioGroup from "@/components/Form/RadioGroup";
import Textarea from "@/components/Form/Textarea";
import { Button } from "@/components/ui/button";
import useAddActivityRecommendation from "@/hooks/activity/useAddActivityRecommendation";
import { useModal } from "@/hooks/useModal";
import { recommendationToInt } from "@/utils/activityConversions";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";

type TAddActivityRecommendationForm = {
  recommendation: "RECOMMENDED" | "NOT_RECOMMENDED";
  doctorRemarks?: string;
};

const AddActivityRecommendationModal = () => {
  const addActivityRecommendationForm =
    useForm<TAddActivityRecommendationForm>();
  const { modalRef, activeModal, closeModal } = useModal();
  const { patientId, centreActivityId, submitterId, activityName } =
    activeModal.props as {
      patientId: number;
      centreActivityId: number;
      submitterId: string;
      activityName: string;
    };

  const recommendationOptions = [
    {
      value: "RECOMMENDED",
      label: "Recommended",
    },
    {
      value: "NOT_RECOMMENDED",
      label: "Not Recommended",
    },
  ];

  const addActivityRecommendation = useAddActivityRecommendation();

  const handleAddActivityRecommendation: SubmitHandler<
    TAddActivityRecommendationForm
  > = ({ recommendation, doctorRemarks }) => {
    const payload: CreateActivityRecommendationPayload = {
      patientId,
      centreActivityId,
      doctorId: submitterId,
      doctorRecommendation: recommendationToInt(recommendation),
      doctorRemarks: doctorRemarks,
    };

    addActivityRecommendation.mutate(payload, {
      onSuccess: () => {
        toast.success("Activity recommendation added successfully");
        closeModal();
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[600px]">
        <h3 className="text-lg font-medium mb-5">
          Add Recommendation for {activityName}
        </h3>
        <form
          onSubmit={addActivityRecommendationForm.handleSubmit(
            handleAddActivityRecommendation
          )}
          className="flex flex-col gap-4"
        >
          <RadioGroup
            label="Recommendation"
            name="recommendation"
            form={addActivityRecommendationForm}
            options={recommendationOptions}
            required={true}
          />
          <Textarea
            label="Remarks"
            name="doctorRemarks"
            form={addActivityRecommendationForm}
            maxLength={255}
          />

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

export default AddActivityRecommendationModal;
