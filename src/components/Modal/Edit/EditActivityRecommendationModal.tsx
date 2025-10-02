import {
  getCentreActivityRecommendationById,
  UpdateActivityRecommendationPayload,
} from "@/api/activity/activityRecommendation";
import RadioGroup from "@/components/Form/RadioGroup";
import Textarea from "@/components/Form/Textarea";
import { Button } from "@/components/ui/button";
import useUpdateActivityRecommendation from "@/hooks/activity/useUpdateActivityRecommendation";
import { useModal } from "@/hooks/useModal";
import {
  intToRecommendation,
  recommendationToInt,
} from "@/utils/activityConversions";
import { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";

type TEditActivityRecommendationForm = {
  recommendation: "RECOMMENDED" | "NOT_RECOMMENDED" | "NEUTRAL";
  doctorRemarks?: string;
};

const EditActivityRecommendationModal = () => {
  const editActivityRecommendationForm =
    useForm<TEditActivityRecommendationForm>();
  const { modalRef, activeModal, closeModal } = useModal();
  const {
    patientId,
    centreActivityId,
    submitterId,
    recommendationId,
    activityName,
  } = activeModal.props as {
    patientId: number;
    centreActivityId: number;
    submitterId: string;
    recommendationId: number;
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

  const editActivityRecommendation = useUpdateActivityRecommendation();

  const handleEditActivityRecommendation: SubmitHandler<
    TEditActivityRecommendationForm
  > = ({ recommendation, doctorRemarks }) => {
    const payload: UpdateActivityRecommendationPayload = {
      patientId,
      centreActivityId,
      doctorId: submitterId,
      recommendationId,
      doctorRecommendation: recommendationToInt(recommendation),
      doctorRemarks: doctorRemarks,
    };

    editActivityRecommendation.mutate(payload, {
      onSuccess: () => {
        toast.success("Activity recommendation updated successfully");
        closeModal();
      },
    });
  };

  const handleFetchActivityRecommendationById = async () => {
    if (!recommendationId) return;

    try {
      const response = await getCentreActivityRecommendationById(
        recommendationId.toString()
      );

      editActivityRecommendationForm.reset({
        recommendation: intToRecommendation(response.doctor_recommendation),
        doctorRemarks: response.doctor_remarks || "",
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch recommendation details");
    }
  };

  useEffect(() => {
    handleFetchActivityRecommendationById();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[600px]">
        <h3 className="text-lg font-medium mb-5">
          Edit Recommendation for {activityName}
        </h3>
        <form
          onSubmit={editActivityRecommendationForm.handleSubmit(
            handleEditActivityRecommendation
          )}
          className="flex flex-col gap-4"
        >
          <RadioGroup
            label="Recommendation"
            name="recommendation"
            form={editActivityRecommendationForm}
            options={recommendationOptions}
            required={true}
          />
          <Textarea
            label="Remarks"
            name="doctorRemarks"
            form={editActivityRecommendationForm}
            maxLength={255}
          />

          <div className="col-span-2 mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditActivityRecommendationModal;
