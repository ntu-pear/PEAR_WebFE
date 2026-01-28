import { useModal } from "@/hooks/useModal";
import { Button } from "../../ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  DoctorNote,
  fetchDoctorNoteById,
  updateDoctorNote,
  UpdateDoctorNoteForm,
} from "@/api/patients/doctorNote";

const EditDoctorNoteModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const [characterLength, setcharacterLength] = useState(0)
  const { noteId, patientId, submitterId, refreshData } = activeModal.props as {
    noteId: string;
    patientId: string;
    submitterId: string;
    refreshData: () => void;
  };
  const [doctorNote, setDoctorNote] = useState<DoctorNote | null>(null);

  const handleFetchDoctorNoteById = async () => {
    if (!patientId || isNaN(Number(patientId))) return;
    if (!noteId || isNaN(Number(noteId))) return;
    try {
      const response = await fetchDoctorNoteById(Number(noteId));
      setDoctorNote(response.data);
      setcharacterLength(response.data.doctorRemarks.length)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to fetch patient doctor note");
    }
  };

  const handleNotesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value
    if (!doctorNote) return;
    setDoctorNote({ ...doctorNote, doctorRemarks: value })
    setcharacterLength(value.length)
  }

  const handleEditDoctorNote = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!doctorNote || !noteId || isNaN(Number(noteId))) return;

    // Create a new FormData object from the event's target
    const formData = new FormData(event.target as HTMLFormElement);

    // Convert FormData entries to an object
    const formDataObj = Object.fromEntries(formData.entries());

    const updateDoctorNoteFormData: UpdateDoctorNoteForm = {
      isDeleted: "0",
      patientId: parseInt(patientId as string, 10),
      doctorId: doctorNote?.doctorId as string,
      doctorRemarks: (formDataObj.doctorRemarks as string).trim(),
      ModifiedById: submitterId as string,
    };

    console.log("updateDoctorNoteFormData", updateDoctorNoteFormData);

    try {
      await updateDoctorNote(Number(noteId), updateDoctorNoteFormData);
      refreshData();
      closeModal();
      toast.success("Patient doctor note updated successfully.");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to update patient doctor note.${error.message}`);
      } else {
        toast.error("Failed to update patient doctor note.");
      }
      console.error(error)
      console.log("Failed to update patient doctor note.")
      closeModal()
    }
  };

  useEffect(() => {
    handleFetchDoctorNoteById();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[500px]">
        <h3 className="text-lg font-medium mb-5">Edit Doctor Note</h3>
        {doctorNote ? (
          <form
            onSubmit={handleEditDoctorNote}
            className="grid grid-cols-2 gap-4"
          >
            <div className="col-span-2">
              <label className="block text-sm font-medium">
                Note<span className="text-red-600">*</span>
              </label>
              <textarea
                name="doctorRemarks"
                value={doctorNote?.doctorRemarks}
                onChange={
                  handleNotesChange
                }
                maxLength={250}
                rows={5}
                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              />
              <p className="text-sm mt-1" style={{ color: "hsl(var(--hint))" }}>
                Word count: {characterLength}/250
              </p>
            </div>

            <div className="col-span-2 mt-6 flex justify-end space-x-2">
              <Button variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit">Update</Button>
            </div>
          </form>
        ) : (
          <p className="text-gray-500">Loading doctor note data...</p>
        )}
      </div>
    </div>
  );
};

export default EditDoctorNoteModal;
