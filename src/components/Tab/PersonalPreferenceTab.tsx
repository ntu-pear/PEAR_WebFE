import { TabsContent } from "../ui/tabs";
import { useModal } from "@/hooks/useModal";
import AddLikeModal from "../Modal/Add/AddLikeModal";
import AddDislikeModal from "../Modal/Add/AddDislikeModal";
import AddHobbyModal from "../Modal/Add/AddHobbyModal";
import AddHabitModal from "../Modal/Add/AddHabitModal";
import LikeDislikeCard from "../Card/LikeDislikeCard";
import HobbyCard from "../Card/HobbyCard";
import HabitCard from "../Card/HabitCard";

export const personalPreferenceColumns = [
  { key: "PreferenceName", header: "Preference Name"},
  { key: "PerferenceRemarks", header: "Remarks" },
];

const PersonalPreferenceTab: React.FC = () => {
  const { activeModal } = useModal();

  return (
    <>
      <TabsContent value="personal-preference">
        <div className="my-2">
          <LikeDislikeCard />
        </div>
        <div className="my-4">
          <HobbyCard />
        </div>
        <div className="my-4">
          <HabitCard />
        </div>
      </TabsContent>
      {activeModal.name === "addLike" && <AddLikeModal />}

      {activeModal.name === "addDislike" && <AddDislikeModal />}

      {activeModal.name === "addHobby" && <AddHobbyModal />}

      {activeModal.name === "addHabit" && <AddHabitModal />}
    </>
  );
};

export default PersonalPreferenceTab;
