import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { useModal } from "@/hooks/useModal";
import Input from "../Form/Input";
import { Card, CardContent, CardHeader } from "../ui/card";

const RegisterExistingGuardianModal: React.FC = () => {
  const { modalRef, closeModal } = useModal();
  const form = useForm<{ nric: string }>();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background rounded-md w-[500px]">
        <Card>
          <CardHeader className="text-xl">Find an existing guardian</CardHeader>
          <CardContent>
            <form>
              <Input
                label="Enter Guardian's NRIC"
                name="nric"
                placeholder="NRIC"
                formReturn={form}
                validation={{
                  pattern: {
                    value: /^[STGM]\d{7}[A-Z]$/,
                    message:
                      "NRIC must be 9 characters in length and starts with character S,T,G,M",
                  },
                }}
              />
              <div className="mt-5 flex justify-end">
                <Button
                  className="bg-slate-500 mr-1"
                  onClick={() => {
                    closeModal();
                  }}
                >
                  Cancel
                </Button>
                <Button className="bg-blue-500" onClick={() => closeModal()}>
                  Search
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterExistingGuardianModal;
