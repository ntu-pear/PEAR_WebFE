import { useModal } from "@/hooks/useModal";
import { Button } from "../../ui/button";
import { addDoctorNote, AddDoctorNoteForm } from "@/api/patients/doctorNote";
import { toast } from "sonner";

const AddDoctorNoteModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { patientId, submitterId, refreshData } = activeModal.props as {
    patientId: string;
    submitterId: string;
    refreshData: () => void;
  };

  const handleAddDoctorNote = async (event: React.FormEvent) => {
    event.preventDefault();
    // Create a new FormData object from the event's target
    const formData = new FormData(event.target as HTMLFormElement);

    // Convert FormData entries to an object
    const formDataObj = Object.fromEntries(formData.entries());

    const doctorNoteFormData: AddDoctorNoteForm = {
      isDeleted: "0",
      patientId: parseInt(patientId as string, 10),
      doctorId: submitterId as string,
      doctorRemarks: formDataObj.notes as string,
      CreatedById: submitterId as string,
      ModifiedById: submitterId as string,
    };

    console.log("doctorNoteFormData", doctorNoteFormData);

    try {
      await addDoctorNote(doctorNoteFormData);
      closeModal();
      toast.success("Doctor note added successfully.");
      refreshData();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error(`Failed to add doctor note.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[400px]">
        <h3 className="text-lg font-medium mb-5">Add Doctor Note</h3>
        <form onSubmit={handleAddDoctorNote} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Notes<span className="text-red-600">*</span>
            </label>
            <textarea
              name="notes"
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
            />
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

export default AddDoctorNoteModal;
