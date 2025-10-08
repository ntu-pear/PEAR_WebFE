import { useModal } from "@/hooks/useModal";
import { Button } from "../../ui/button";

const AddActivityPreferenceModal: React.FC = () => {
  const { modalRef, closeModal } = useModal();
  const handleAddActivityPreference = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Patient Activity Preference Added!");
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[400px]">
        <h3 className="text-lg font-medium mb-5">
          Add Centre Activity Preference
        </h3>
        <form
          onSubmit={handleAddActivityPreference}
          className="grid grid-cols-2 gap-4"
        >
          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Centre Activity Preference<span className="text-red-600">*</span>
            </label>
            <select
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="">Please select an option</option>
              <option
                value="1"
                title="Lunch, Compulsory, Fixed: Monday 1100-1200, Tuesday 1100-1200, Wednesday 1100-1200, Thursday 1100-1200, Friday 1100-1200, Group: Min 0 pax, Min 0 hr, Max 0 hr"
              >
                Lunch, Compulsory, Fixed: Monday 1100-1200, Tuesday 1100-1200,
                Wednesday 1100-1200, Thursday 1100-1200, Friday 1100-1200,
                Group: Min 0 pax, Min 0 hr, Max 0 hr
              </option>
              <option
                value="2"
                title="Breathing+Vital Check, Compulsory, Fixed: Monday 0800-0900, Tuesday 0800-0900, Wednesday 0800-0900, Thursday 0800-0900, Friday 0800-0900, Group: Min 0 pax, Min 0 hr, Max 0 hr"
              >
                Breathing+Vital Check, Compulsory, Fixed: Monday 0800-0900,
                Tuesday 0800-0900, Wednesday 0800-0900, Thursday 0800-0900,
                Friday 0800-0900, Group: Min 0 pax, Min 0 hr, Max 0 hr
              </option>
              <option
                value="3"
                title="Board Games, Optional, Not Fixed, Group: Min 2 pax, Min 0 hr, Max 0 hr"
              >
                Board Games, Optional, Not Fixed, Group: Min 2 pax, Min 0 hr,
                Max 0 hr
              </option>
              <option
                value="4"
                title="Movie Screening, Optional, Not Fixed, Group: Min 2 pax, Min 0 hr, Max 0 hr"
              >
                Movie Screening, Optional, Not Fixed, Group: Min 2 pax, Min 0
                hr, Max 0 hr
              </option>
              <option
                value="5"
                title="Brisk Walking, Optional, Fixed: Monday 1400-1500, Tuesday 1400-1500, Wednesday 1400-1500, Thursday 1400-1500, Friday 1400-1500, Group: Min 2 pax, Min 0 hr, Max 0 hr"
              >
                Brisk Walking, Optional, Fixed: Monday 1400-1500, Tuesday
                1400-1500, Wednesday 1400-1500, Thursday 1400-1500, Friday
                1400-1500, Group: Min 2 pax, Min 0 hr, Max 0 hr
              </option>
              <option
                value="6"
                title="Mahjong, Optional, Not Fixed, Group: Min 4 pax, Min 0 hr, Max 0 hr"
              >
                Mahjong, Optional, Not Fixed, Group: Min 4 pax, Min 0 hr, Max 0
                hr
              </option>
              <option
                value="7"
                title="Musical Instrument Lesson, Optional, Fixed: Tuesday 0900-1000, Thursday 0900-1000, Group: Min 2 pax, Min 0 hr, Max 0 hr"
              >
                Musical Instrument Lesson, Optional, Fixed: Tuesday 0900-1000,
                Thursday 0900-1000, Group: Min 2 pax, Min 0 hr, Max 0 hr
              </option>
              <option
                value="8"
                title="Story Time, Optional, Not Fixed, Group: Min 2 pax, Min 0 hr, Max 0 hr"
              >
                Story Time, Optional, Not Fixed, Group: Min 2 pax, Min 0 hr, Max
                0 hr
              </option>
              <option
                value="9"
                title="Physiotherapy, Optional, Fixed: Monday 0900-1000, Tuesday 1000-1100, Wednesday 0900-1000, Thursday 1200-1300, Friday 1300-1400, Individual, Min 0 hr, Max 0 hr"
              >
                Physiotherapy, Optional, Fixed: Monday 0900-1000, Tuesday
                1000-1100, Wednesday 0900-1000, Thursday 1200-1300, Friday
                1300-1400, Individual, Min 0 hr, Max 0 hr
              </option>
              <option
                value="10"
                title="String beads, Optional, Not Fixed, Individual, Min 0 hr, Max 0 hr"
              >
                String beads, Optional, Not Fixed, Individual, Min 0 hr, Max 0
                hr
              </option>
              <option
                value="11"
                title="Sewing, Optional, Not Fixed, Individual, Min 0 hr, Max 0 hr"
              >
                Sewing, Optional, Not Fixed, Individual, Min 0 hr, Max 0 hr
              </option>
              <option
                value="12"
                title="Cup Stacking Game, Optional, Not Fixed, Individual, Min 0 hr, Max 0 hr"
              >
                Cup Stacking Game, Optional, Not Fixed, Individual, Min 0 hr,
                Max 0 hr
              </option>
              <option
                value="13"
                title="Sort poker chips, Optional, Not Fixed, Individual, Min 0 hr, Max 0 hr"
              >
                Sort poker chips, Optional, Not Fixed, Individual, Min 0 hr, Max
                0 hr
              </option>
              <option
                value="14"
                title="Origami, Optional, Not Fixed, Individual, Min 0 hr, Max 0 hr"
              >
                Origami, Optional, Not Fixed, Individual, Min 0 hr, Max 0 hr
              </option>
              <option
                value="15"
                title="Picture Coloring, Optional, Not Fixed, Individual, Min 0 hr, Max 0 hr"
              >
                Picture Coloring, Optional, Not Fixed, Individual, Min 0 hr, Max
                0 hr
              </option>
              <option
                value="16"
                title="Clip Coupons, Optional, Not Fixed, Individual, Min 0 hr, Max 0 hr"
              >
                Clip Coupons, Optional, Not Fixed, Individual, Min 0 hr, Max 0
                hr
              </option>
              <option
                value="17"
                title="Cutting Pictures, Optional, Not Fixed, Individual, Min 0 hr, Max 0 hr"
              >
                Cutting Pictures, Optional, Not Fixed, Individual, Min 0 hr, Max
                0 hr
              </option>
              <option
                value="18"
                title="Watch television, Optional, Not Fixed, Individual, Min 0 hr, Max 0 hr"
              >
                Watch television, Optional, Not Fixed, Individual, Min 0 hr, Max
                0 hr
              </option>
              <option
                value="19"
                title="Act1, Compulsory, Fixed: Monday 1300-1400, Tuesday 1300-1400, Wednesday 1300-1400, Friday 1300-1400, Group: Min 0 pax, Min 0 hr, Max 0 hr"
              >
                Act1, Compulsory, Fixed: Monday 1300-1400, Tuesday 1300-1400,
                Wednesday 1300-1400, Friday 1300-1400, Group: Min 0 pax, Min 0
                hr, Max 0 hr
              </option>
              <option
                value="20"
                title="Leslie history routine, Compulsory, Fixed: Monday 1400-1500, Wednesday 1400-1500, Friday 1400-1500, Individual, Min 0 hr, Max 0 hr"
              >
                Leslie history routine, Compulsory, Fixed: Monday 1400-1500,
                Wednesday 1400-1500, Friday 1400-1500, Individual, Min 0 hr, Max
                0 hr
              </option>
              <option
                value="21"
                title="Leslie geography routine, Optional, Fixed: Tuesday 1400-1500, Thursday 1400-1500, Individual, Min 0 hr, Max 0 hr"
              >
                Leslie geography routine, Optional, Fixed: Tuesday 1400-1500,
                Thursday 1400-1500, Individual, Min 0 hr, Max 0 hr
              </option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium">
              Like/Dislike<span className="text-red-600">*</span>
            </label>
            <select
              className="mt-1 block w-full p-2 border rounded-md text-gray-900"
              required
            >
              <option value="">Please select an option</option>
              <option value="LIKE">Like</option>
              <option value="DISLIKE">Dislike</option>
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

export default AddActivityPreferenceModal;
